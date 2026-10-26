// Generates the app icons from the design tokens, so the icon always matches the app's palette.
//   npm run make:icons
// The icon is a calorie ring (like the progress bar on the Track tab) with three macro meters inside.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.join(__dirname, '..');
const themeSrc = fs.readFileSync(path.join(root, 'lib/theme.js'), 'utf8');
const paletteBlock = themeSrc.slice(themeSrc.indexOf('export const palette'), themeSrc.indexOf('};', themeSrc.indexOf('export const palette')));
const p = Object.fromEntries([...paletteBlock.matchAll(/(\w+):\s*'(#[0-9a-fA-F]{6})'/g)].map((m) => [m[1], m[2]]));
for (const key of ['green', 'greenSoft', 'blue', 'pink', 'purple', 'card']) {
  if (!p[key]) throw new Error(`palette color "${key}" not found in lib/theme.js`);
}

// 512 x 512 canvas. Everything important sits inside the central ~67%, which is also the "safe zone"
// that Android crops to when it masks the icon into a circle or squircle.
function iconSvg({ rounded }) {
  const R = 150; // ring radius
  const circumference = 2 * Math.PI * R;
  const arc = circumference * 0.72; // how full the ring is
  const bars = [
    { y: 214, w: 118, color: p.blue },
    { y: 252, w: 90, color: p.pink },
    { y: 290, w: 64, color: p.purple },
  ];
  const corner = rounded ? 112 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${corner}" fill="${p.green}"/>
  <circle cx="256" cy="256" r="${R}" fill="none" stroke="${p.greenSoft}" stroke-opacity="0.3" stroke-width="44"/>
  <circle cx="256" cy="256" r="${R}" fill="none" stroke="${p.card}" stroke-width="44" stroke-linecap="round"
    stroke-dasharray="${arc.toFixed(1)} ${circumference.toFixed(1)}" transform="rotate(-90 256 256)"/>
  ${bars.map((b) => `<rect x="${256 - 59}" y="${b.y}" width="${b.w}" height="26" rx="13" fill="${b.color}"/>`).join('\n  ')}
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
