import { useEffect, useRef } from 'react';

// The page background: layered stars that drift toward the viewer, a dark
// nebula, and an optional belt of rocks. Moving the pointer, tilting a
// finger across the screen or scrolling shifts the layers by depth.

const STAR_COLORS = ['#cfe3ff', '#ffffff', '#ffffff', '#fff4e6', '#a9c8ff', '#ffe9d1'];

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function makeNebula(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w / 2));
  c.height = Math.max(1, Math.round(h / 2));
  const ctx = c.getContext('2d');
  const rnd = seeded(5);
  const blobs = [
    [0.2, 0.25, 0.55, 'rgba(11, 61, 145, 0.32)'],
    [0.85, 0.15, 0.45, 'rgba(30, 144, 255, 0.10)'],
    [0.7, 0.8, 0.6, 'rgba(60, 40, 140, 0.20)'],
    [0.1, 0.9, 0.4, 'rgba(11, 61, 145, 0.18)'],
    [0.5, 0.5, 0.35, 'rgba(96, 165, 250, 0.05)'],
  ];
  blobs.forEach(([x, y, r, col]) => {
    const g = ctx.createRadialGradient(x * c.width, y * c.height, 0, x * c.width, y * c.height, r * Math.max(c.width, c.height));
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, c.width, c.height);
  });
  // Faint dust grain so the haze is not a smooth gradient.
  for (let i = 0; i < 1600; i += 1) {
    ctx.fillStyle = `rgba(160, 190, 255, ${rnd() * 0.05})`;
    ctx.fillRect(rnd() * c.width, rnd() * c.height, 1, 1);
  }
  return c;
}

function makeRock(rnd) {
  const n = 6 + Math.floor(rnd() * 4);
  const pts = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    const r = 0.65 + rnd() * 0.45;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

export default function Starfield({ paused, belt, dense }) {
  const ref = useRef(null);
  const props = useRef({ paused, belt, dense });
  props.current = { paused, belt, dense };
  const wakeRef = useRef(() => {});

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const rnd = seeded(42);
    let w = 0;
    let h = 0;
    let dpr = 1;
    let nebula;
    let frame = 0;
    let last = performance.now();
    let t = 0;

    // Three depth layers. Depth 1 is far and slow, 3 is near and fast.
    const stars = [];
    const STAR_COUNT = Math.min(2400, Math.round((window.innerWidth * window.innerHeight) / 700));
    for (let i = 0; i < STAR_COUNT; i += 1) {
      const layer = rnd() < 0.6 ? 1 : rnd() < 0.75 ? 2 : 3;
      stars.push({
        x: rnd() * 2 - 1,
        y: rnd() * 2 - 1,
        z: rnd(),
        layer,
        size: layer === 1 ? 0.5 + rnd() * 0.5 : layer === 2 ? 0.8 + rnd() * 0.7 : 1.2 + rnd() * 1.1,
        color: STAR_COLORS[Math.floor(rnd() * STAR_COLORS.length)],
        tw: rnd() * Math.PI * 2,
        twSpeed: 0.6 + rnd() * 2.2,
      });
    }

    const rocks = [];
    for (let i = 0; i < 140; i += 1) {
      rocks.push({
        a: rnd() * Math.PI * 2,
        r: 0.82 + rnd() * 0.36,
        lift: (rnd() - 0.5) * 0.08,
        speed: 0.012 + rnd() * 0.02,
        size: 1.2 + Math.pow(rnd(), 3) * 5,
        spin: rnd() * Math.PI * 2,
        spinSpeed: (rnd() - 0.5) * 1.6,
        shape: makeRock(rnd),
        shade: 90 + Math.floor(rnd() * 60),
        dense: rnd() < 0.55,
      });
    }

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      wake();
    };
    const onScroll = () => wake();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      nebula = makeNebula(w, h);
      draw();
    };

    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      const scroll = (window.scrollY || 0) + (document.querySelector('.track')?.scrollLeft || 0) * 0.5;
      const px = pointer.x;
      const py = pointer.y;

      // Nebula, moved the least.
      ctx.globalAlpha = 1;
      ctx.drawImage(nebula, -40 - px * 14 - (scroll * 0.01) % 40, -40 - py * 14, w + 80, h + 80);

      const cx = w / 2;
      const cy = h / 2;
      const span = Math.max(w, h) * 0.75;
      for (const s of stars) {
        // Forward drift: z falls toward 0, which pushes the star outward.
        const depth = 0.25 + s.z * 1.5;
        const par = s.layer * 9;
        let x = cx + (s.x * span) / depth - px * par - ((scroll * 0.04 * s.layer) % w);
        let y = cy + (s.y * span) / depth - py * par;
        x = ((x % w) + w) % w;
        y = ((y % h) + h) % h;
        const near = 1 - s.z;
        const twinkle = 0.6 + 0.4 * Math.sin(t * s.twSpeed + s.tw);
        const r = s.size * (0.55 + near * 0.9);
        ctx.globalAlpha = Math.min(1, (0.25 + near * 0.75) * twinkle);
        ctx.fillStyle = s.color;
        if (r < 1.1) {
          ctx.fillRect(x, y, r * 1.4, r * 1.4);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
          if (s.layer === 3 && twinkle > 0.85) {
            ctx.globalAlpha *= 0.35;
            ctx.fillRect(x - r * 3, y - 0.4, r * 6, 0.8);
            ctx.fillRect(x - 0.4, y - r * 3, 0.8, r * 6);
          }
        }
      }

      const { belt, dense } = props.current;
      if (belt) {
        // A wide tilted ring of rocks around the middle of the screen. The
        // front half is drawn larger and brighter than the back half.
        const rx = w * 0.62;
        const ry = h * 0.16;
        const by = h * 0.5 - py * 18;
        for (const k of rocks) {
          if (!dense && k.dense) continue;
          const a = k.a;
          const sx = cx + Math.cos(a) * rx * k.r - px * 26;
          const sy = by + Math.sin(a) * ry * k.r + k.lift * h;
          const front = (Math.sin(a) + 1) / 2;
          const size = k.size * (0.6 + front * 0.8);
          ctx.globalAlpha = 0.25 + front * 0.55;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(k.spin);
          ctx.beginPath();
          k.shape.forEach(([u, v], i) => (i ? ctx.lineTo(u * size, v * size) : ctx.moveTo(u * size, v * size)));
          ctx.closePath();
          const g = ctx.createLinearGradient(-size, -size, size, size);
          g.addColorStop(0, `rgb(${k.shade + 50},${k.shade + 45},${k.shade + 40})`);
          g.addColorStop(1, `rgb(${k.shade * 0.3},${k.shade * 0.3},${k.shade * 0.35})`);
          ctx.fillStyle = g;
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    }

    function tick(now) {
      frame = 0;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { paused: p } = props.current;
      pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * 3);
      pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * 3);
      if (!p) {
        t += dt;
        for (const s of stars) {
          s.z -= dt * 0.012 * s.layer;
          if (s.z <= 0) {
            s.z = 1;
            s.x = Math.random() * 2 - 1;
            s.y = Math.random() * 2 - 1;
          }
        }
        for (const k of rocks) {
          k.a += dt * k.speed;
          k.spin += dt * k.spinSpeed;
        }
      }
      draw();
      const settling = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.002;
      if (!p || settling) frame = requestAnimationFrame(tick);
    }

    function wake() {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    wakeRef.current = wake;

    resize();
    wake();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, []);

  useEffect(() => {
    wakeRef.current();
  }, [paused, belt, dense]);

  return <canvas ref={ref} className="starfield" aria-hidden="true" />;
}
