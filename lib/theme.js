// Body Log design tokens: the ONLY place a color value may be written.
//
// Everything else (styles/app.css, components, pages) must use these through CSS variables, e.g.
// var(--green), or import `palette` from this file when a library needs a raw value (charts).
// `npm run check:design` fails the build if a color literal appears anywhere else.
// See DESIGN.md for how each color is used.

export const palette = {
  // Neutrals
  cream: '#efece6', // page background
  card: '#fdfcf9', // cards and sheets
  ink: '#1c2b24', // text
  muted: '#7d8681', // secondary text
  line: '#e7e3da', // hairlines and borders

  // Each hue is a dense color (fills, text, buttons) and a soft color (tracks, tints, backgrounds).
  green: '#1f4a36',
  greenSoft: '#b9c8bd',
  blue: '#5b67e8',
  blueSoft: '#d6d9f8',
  pink: '#e0527f',
  pinkSoft: '#f6d6e1',
  purple: '#a98bdc',
  purpleSoft: '#e6ddf4',
};

// Blends two hex colors (amount = how much of `a`). Used only to derive tints of the palette above,
// so a derived color is always a mix of palette colors, never a new hue.
function mix(a, b, amount) {
  const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const channel = (x, y) => Math.round(x * amount + y * (1 - amount)).toString(16).padStart(2, '0');
  return `#${channel(ar, br)}${channel(ag, bg)}${channel(ab, bb)}`;
}

function alpha(hex, a) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const derived = {
  greenTint: mix(palette.greenSoft, palette.card, 0.45), // soft green surface for tiles and notes
  greenDeep: mix(palette.green, palette.ink, 0.55), // pressed/hover state of dense green
};

export const tokens = {
  // Neutrals
  '--bg': palette.cream,
  '--card': palette.card,
  '--ink': palette.ink,
  '--muted': palette.muted,
  '--line': palette.line,

  // Hues
  '--green': palette.green,
  '--green-soft': palette.greenSoft,
  '--green-tint': derived.greenTint,
  '--green-deep': derived.greenDeep,
  '--blue': palette.blue,
  '--blue-soft': palette.blueSoft,
  '--pink': palette.pink,
  '--pink-soft': palette.pinkSoft,
  '--purple': palette.purple,
  '--purple-soft': palette.purpleSoft,

  // Roles: use these in components rather than the raw hues where a role exists
  '--accent': 'var(--green)', // primary buttons, active tab, calorie fill
  '--accent-hover': 'var(--green-deep)',
  '--on-accent': 'var(--card)', // text on dense fills
  '--alert': 'var(--pink)', // delete, errors
  '--alert-soft': 'var(--pink-soft)',
  '--sage': 'var(--green-soft)', // calorie bar track
  '--carbs': 'var(--blue)',
  '--carbs-soft': 'var(--blue-soft)',
  '--protein': 'var(--pink)',
  '--protein-soft': 'var(--pink-soft)',
  '--fat': 'var(--purple)',
  '--fat-soft': 'var(--purple-soft)',
  '--fiber': 'var(--green)',
  '--fiber-soft': 'var(--green-soft)',

  // Overlays and shadows are always ink at some opacity
  '--scrim': alpha(palette.ink, 0.35),
  '--scrim-strong': alpha(palette.ink, 0.6),
  '--shadow-card': `0 1px 3px ${alpha(palette.ink, 0.06)}`,
  '--shadow-pop': `0 10px 40px ${alpha(palette.ink, 0.2)}`,
  '--shadow-tip': `0 6px 20px ${alpha(palette.ink, 0.14)}`,

  // Type
  '--sans': "var(--font-dm-sans, 'DM Sans'), system-ui, -apple-system, sans-serif",
};

// The :root block injected into every page by pages/_document.js.
export function themeCss() {
  return `:root{${Object.entries(tokens).map(([k, v]) => `${k}:${v}`).join(';')}}`;
}
