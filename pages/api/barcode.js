// Looks a scanned barcode up in USDA FoodData Central (branded foods).
// The key stays on the server: set USDA_API_KEY in .env.local (or the host's env vars).
const FDC = 'https://api.nal.usda.gov/fdc/v1';
const NUTRIENT = { calories: 1008, protein: 1003, fat: 1004, carbs: 1005, fiber: 1079 };

const stripZeros = (s) => String(s || '').replace(/^0+/, '');

// USDA stores GTINs inconsistently (most as 12-digit UPC-A, some padded to 14), and a scanner
// may report the 13-digit EAN form, so try the common shapes of the same number.
function codeVariants(code) {
  const core = stripZeros(code);
  const variants = new Set([code]);
  if (core.length <= 12) variants.add(core.padStart(12, '0'));
  variants.add(core.padStart(14, '0'));
  variants.add(core.padStart(13, '0'));
  return [...variants];
}

const round1 = (n) => Math.round(n * 10) / 10;

function titleCase(s) {
  if (!s) return '';
  // USDA descriptions are often ALL CAPS; leave mixed-case names alone.
  if (s !== s.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s,/(-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  res.setHeader('Cache-Control', 'no-store');

  const code = String(req.query.code || '').replace(/\D/g, '');
  // Reject all-zero and near-empty codes too: they'd otherwise 'match' products with no barcode on file.
  if (code.length < 8 || code.length > 14 || stripZeros(code).length < 6) {
    return res.status(400).json({ error: 'Enter a barcode with 8 to 14 digits' });
  }
  const key = (process.env.USDA_API_KEY || '').trim();
  if (!key) {
    return res.status(500).json({ code: 'no_key', error: 'Add USDA_API_KEY to .env.local to look up barcodes' });
  }

  try {
    let match = null;
    for (const variant of codeVariants(code)) {
      const url = `${FDC}/foods/search?dataType=Branded&pageSize=10&query=${encodeURIComponent(variant)}&api_key=${encodeURIComponent(key)}`;
      const r = await fetch(url);
      if (r.status === 403 || r.status === 401) {
        return res.status(500).json({ code: 'bad_key', error: 'The USDA key was rejected. Check USDA_API_KEY.' });
      }
      if (r.status === 429) {
        return res.status(429).json({ error: 'USDA is rate limiting requests. Try again in a minute.' });
      }
      if (!r.ok) throw new Error(`USDA search failed (${r.status})`);
      const j = await r.json();
      match = (j.foods || []).find((f) => f.gtinUpc && stripZeros(f.gtinUpc) === stripZeros(code));
      if (match) break;
    }
    if (!match) return res.status(200).json({ found: false, code });

    const per100 = {};
    for (const [name, id] of Object.entries(NUTRIENT)) {
      const n = (match.foodNutrients || []).find((x) => x.nutrientId === id);
      per100[name] = n ? Number(n.value) || 0 : 0;
    }

    // Label values (per serving) match the package; fetch them for the matched product.
    let label = null;
    try {
      const d = await fetch(`${FDC}/food/${match.fdcId}?api_key=${encodeURIComponent(key)}`);
      if (d.ok) {
        const ln = (await d.json()).labelNutrients;
        if (ln && ln.calories) {
          label = {
            calories: Number(ln.calories?.value) || 0,
            protein: Number(ln.protein?.value) || 0,
            carbs: Number(ln.carbohydrates?.value) || 0,
            fat: Number(ln.fat?.value) || 0,
            fiber: Number(ln.fiber?.value) || 0,
          };
        }
      }
    } catch {
      // Falls back to the per-100g values below.
    }

    const unit = String(match.servingSizeUnit || '').toLowerCase();
    const servingGrams = match.servingSize && (unit === 'g' || unit === 'grm' || unit === 'ml' || unit === 'mlt')
      ? Number(match.servingSize)
      : null;

    res.status(200).json({
      found: true,
      code,
      fdcId: match.fdcId,
      name: titleCase(match.description),
      brand: titleCase(match.brandName || match.brandOwner || ''),
      servingGrams,
      servingLabel: match.householdServingFullText || (servingGrams ? `${servingGrams} g` : null),
      per100g: Object.fromEntries(Object.entries(per100).map(([k, v]) => [k, round1(v)])),
      perServing: label,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
