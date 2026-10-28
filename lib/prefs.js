// Food preferences are stored as one block of text (profile.diet_prefs) that the advisor reads as-is.
// The settings page shows it in sections, so this splits that text by its "Likes:", "Dislikes:" ... labels
// and writes it back in the same shape. Text with no label (older notes) is kept under "Notes".
export const PREF_SECTIONS = [
  { key: 'likes', label: 'Likes', match: /^likes?$/i },
  { key: 'dislikes', label: 'Dislikes', match: /^dislikes?$/i },
  { key: 'allergies', label: 'Allergies', match: /^allerg(y|ies)$/i },
  { key: 'pantry', label: 'Pantry staples', match: /^(pantry( staples)?|staples)$/i },
  { key: 'buys', label: 'Usually buy', match: /^(usually buy|usual purchases|common purchases)$/i },
  { key: 'notes', label: 'Notes', match: /^notes?$/i },
];

const LABEL_LINE = /^\s*([A-Za-z][A-Za-z ]{1,20}?)\s*:\s*(.*)$/;

export function parsePrefs(text) {
  const out = Object.fromEntries(PREF_SECTIONS.map((s) => [s.key, '']));
  let current = 'notes';
  const add = (key, line) => {
    if (line) out[key] = out[key] ? `${out[key]}\n${line}` : line;
  };
  for (const raw of String(text || '').split('\n')) {
    const m = raw.match(LABEL_LINE);
    const section = m && PREF_SECTIONS.find((s) => s.match.test(m[1].trim()));
    if (section) {
      current = section.key;
      add(current, m[2].trim());
    } else {
      add(current, raw.trim());
    }
  }
  return out;
}

export function formatPrefs(sections) {
  return PREF_SECTIONS
    .map((s) => ({ label: s.label, value: String(sections[s.key] || '').trim() }))
    .filter((s) => s.value)
    .map((s) => `${s.label}: ${s.value}`)
    .join('\n');
}

// "salmon, Greek yogurt; spicy food" -> ['salmon', 'Greek yogurt', 'spicy food']
export function splitItems(value) {
  return String(value || '').split(/[,;\n]+/).map((v) => v.trim()).filter(Boolean);
}
