// Generates the app icons from the design tokens, so the icon always matches the app's palette.
//   npm run make:icons
// The icon is the "m." monogram: a soft-serif m in deep green with a pink period, on cream.
// The letter shapes live in lib/mise-glyphs.json (outlines of Fraunces, soft), so no font is needed here.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const themeSrc = fs.readFileSync(path.join(root, 'lib/theme.js'), 'utf8');
const paletteBlock = themeSrc.slice(themeSrc.indexOf('export const palette'), themeSrc.indexOf('};', themeSrc.indexOf('export const palette')));
const p = Object.fromEntries([...paletteBlock.matchAll(/(\w+):\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => [m[1], m[2]]));
for (const key of ['green', 'pink', 'card', 'line']) {
  if (!p[key]) throw new Error(`palette color "${key}" not found in lib/theme.js`);
}
const glyphs = JSON.parse(fs.readFileSync(path.join(root, 'lib/mise-glyphs.json'), 'utf8')).monogram;

// 512 x 512 canvas. The "m." sits in the middle ~66%, which is also the safe zone Android crops to
// when it masks the icon into a circle or squircle.
const MARK_WIDTH = 330;

function iconSvg({ rounded }) {
  const b = glyphs.bbox;
  const scale = MARK_WIDTH / (b.x2 - b.x1);
  const tx = 256 - ((b.x1 + b.x2) / 2) * scale;
  const ty = 256 - ((b.y1 + b.y2) / 2) * scale;
  const corner = rounded ? 112 : 0;
  // Rounded versions keep a hairline so the cream tile still reads on light backgrounds.
  const border = rounded ? `\n  <rect x="1.5" y="1.5" width="509" height="509" rx="${corner - 1.5}" fill="none" stroke="${p.line}" stroke-width="3"/>` : '';
  const shapes = glyphs.paths.map((g) => `<path d="${g.d}" fill="${g.char === '.' ? p.pink : p.green}"/>`).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${corner}" fill="${p.card}"/>${border}
  <g transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${scale.toFixed(5)})">
    ${shapes}
  </g>
</svg>
`;
}

async function png(svg, size, file) {
  await sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(root, 'public', file));
  console.log('wrote public/' + file, `${size}x${size}`);
}

// A .ico file is a small container; modern ones can hold a PNG as-is. Some browsers still ask for /favicon.ico.
function icoFromPng(pngBuf, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry[0] = size;
  entry[1] = size;
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8);
  entry.writeUInt32LE(22, 12); // image data starts after the 6 + 16 byte headers
  return Buffer.concat([header, entry, pngBuf]);
}

(async () => {
  const any = iconSvg({ rounded: true }); // for places that show the icon as-is
  const full = iconSvg({ rounded: false }); // for places that apply their own mask (iOS, Android adaptive)
  fs.writeFileSync(path.join(root, 'public/icon.svg'), any);
  console.log('wrote public/icon.svg');
  await png(any, 512, 'icon-512.png');
  await png(any, 192, 'icon-192.png');
  await png(any, 32, 'icon-32.png');
  await png(full, 512, 'icon-maskable-512.png');
  await png(full, 180, 'apple-touch-icon.png');
  fs.writeFileSync(path.join(root, 'public/favicon.ico'), icoFromPng(fs.readFileSync(path.join(root, 'public/icon-32.png')), 32));
  console.log('wrote public/favicon.ico');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
