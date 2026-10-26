// Fails when the UI strays from the design system (see DESIGN.md):
//  1. no color literals (hex, rgb(), hsl(), named colors) outside lib/theme.js
//  2. every var(--token) must exist
//  3. the web manifest colors must be palette colors
// Runs automatically before `npm run build`, or on demand with `npm run check:design`.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const themeSrc = fs.readFileSync(path.join(root, 'lib/theme.js'), 'utf8');

const paletteBlock = themeSrc.slice(themeSrc.indexOf('export const palette'), themeSrc.indexOf('};', themeSrc.indexOf('export const palette')));
const paletteHex = new Set([...paletteBlock.matchAll(/'(#[0-9a-fA-F]{6})'/g)].map((m) => m[1].toLowerCase()));
const tokensBlock = themeSrc.slice(themeSrc.indexOf('export const tokens'), themeSrc.indexOf('// The :root block'));
const tokenNames = new Set([...tokensBlock.matchAll(/'(--[\w-]+)':/g)].map((m) => m[1]));

const SCAN_DIRS = ['pages', 'components', 'lib', 'styles'];
const SKIP = new Set([path.join(root, 'lib/theme.js')]);
const NAMED = 'white|black|red|green|blue|orange|yellow|purple|pink|gray|grey|teal|navy|brown|gold|silver|maroon|cyan|magenta|beige|ivory|coral|salmon|crimson|violet|indigo|lime|olive|aqua|tan|khaki';
const COLOR_PROP = '(?:color|background|background-color|border|border-color|border-top|border-bottom|border-left|border-right|outline|fill|stroke|box-shadow|text-shadow)';

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|jsx|css)$/.test(name) && !SKIP.has(p)) out.push(p);
  }
  return out;
}

const problems = [];
const report = (file, line, msg) => problems.push(`${path.relative(root, file)}:${line}  ${msg}`);

const localProps = new Set();
const files = SCAN_DIRS.flatMap((d) => walk(path.join(root, d)));
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.css')) for (const m of text.matchAll(/(--[\w-]+)\s*:/g)) localProps.add(m[1]);
}

for (const file of files) {
  const isCss = file.endsWith('.css');
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((raw, i) => {
    const n = i + 1;
    // Drop comments and var(...) so token names like --green aren't mistaken for the color "green".
    let line = raw.replace(/\/\*.*?\*\//g, '').replace(/(^|\s)\/\/.*$/, '');
    for (const m of line.matchAll(/var\((--[\w-]+)/g)) {
      if (!tokenNames.has(m[1]) && !localProps.has(m[1])) report(file, n, `unknown token ${m[1]}`);
    }
    line = line.replace(/var\([^)]*\)/g, '');
    for (const m of line.matchAll(/(?<![&\w])#[0-9a-fA-F]{3,8}\b/g)) report(file, n, `color literal ${m[0]} (use a token from lib/theme.js)`);
    for (const m of line.matchAll(/\b(?:rgba?|hsla?)\([^)]*\)/g)) report(file, n, `color function ${m[0]} (use a token from lib/theme.js)`);
    if (isCss) {
      // Every declaration on the line, not just the last one.
      for (const decl of line.matchAll(new RegExp(`(?:^|[{;])\\s*${COLOR_PROP}\\s*:\\s*([^;}]*)`, 'gi'))) {
        for (const m of decl[1].matchAll(new RegExp(`(?<![-\\w.#])(${NAMED})(?![-\\w])`, 'gi'))) report(file, n, `named color "${m[1]}" (use a token from lib/theme.js)`);
      }
    } else {
      for (const m of line.matchAll(new RegExp(`\\b(?:fill|stroke|color|background|backgroundColor|borderColor|stopColor)\\s*[=:]\\s*\\{?\\s*['"](${NAMED})['"]`, 'gi'))) {
        report(file, n, `named color "${m[1]}" (use a token from lib/theme.js)`);
      }
    }
  });
}

const manifestPath = path.join(root, 'public/manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const key of ['theme_color', 'background_color']) {
    const v = String(manifest[key] || '').toLowerCase();
    if (v && !paletteHex.has(v)) report(manifestPath, 1, `${key} ${v} is not a palette color`);
  }
}

if (problems.length) {
  console.error(`\nDesign check failed (${problems.length}). Colors may only come from lib/theme.js:\n`);
  for (const p of problems) console.error('  ' + p);
  console.error('\nSee DESIGN.md.\n');
  process.exit(1);
}
console.log(`Design check passed: ${files.length} files use only palette tokens (${paletteHex.size} palette colors, ${tokenNames.size} tokens).`);
