// Surfaces we have to draw ourselves because no NASA map exists for them.

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

let uranusUrl;

// Voyager 2 saw Uranus as a nearly blank blue-green globe, so this is
// a flat tint with faint latitude bands and nothing else.
export function uranusTexture() {
  if (uranusUrl) return uranusUrl;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#8fc7cc');
  g.addColorStop(0.3, '#a9dcdd');
  g.addColorStop(0.5, '#b4e2e1');
  g.addColorStop(0.7, '#a6dadb');
  g.addColorStop(1, '#86bfc6');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);
  const rnd = seeded(7);
  for (let i = 0; i < 14; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.015 + rnd() * 0.03})`;
    ctx.fillRect(0, rnd() * 256, 512, 2 + rnd() * 10);
  }
  uranusUrl = c.toDataURL('image/jpeg', 0.9);
  return uranusUrl;
}

// A radial strip for Saturn's rings: left edge is the inner rim.
export function ringCanvas() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 4;
  const ctx = c.getContext('2d');
  const rnd = seeded(21);
  for (let x = 0; x < 512; x += 1) {
    const t = x / 511;
    let alpha = 0.55 + rnd() * 0.3;
    if (t < 0.18) alpha *= 0.35; // faint inner C ring
    if (t > 0.62 && t < 0.68) alpha = 0.04; // Cassini Division
    if (t > 0.97) alpha *= 0.3;
    const light = 150 + Math.round(rnd() * 60);
    ctx.fillStyle = `rgba(${light + 30},${light + 5},${light - 40},${alpha.toFixed(3)})`;
    ctx.fillRect(x, 0, 1, 4);
  }
  return c;
}

export function starPoints(count, seed = 3) {
  const rnd = seeded(seed);
  return Array.from({ length: count }, () => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd()) * 96;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 0.25 + rnd() * 0.5, o: 0.35 + rnd() * 0.6 };
  });
}
