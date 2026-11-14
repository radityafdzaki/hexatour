// The real robots of a world in the 3D view: orbiters circle it, flybys
// pass once and leave, landers and rovers sit at their landing sites, and
// the deep-space craft head outward. Each has a name label.
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LatheGeometry,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from 'three';

function panelTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 32;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0d1f4d';
  ctx.fillRect(0, 0, 64, 32);
  ctx.strokeStyle = 'rgba(160, 190, 255, 0.55)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 64; x += 8) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, 32);
    ctx.stroke();
  }
  for (let y = 0; y <= 32; y += 8) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(64, y + 0.5);
    ctx.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

let sharedPanel;

// A spacecraft: foil-wrapped bus, two solar wings with cells, a parabolic
// high-gain dish on a short mast, and a thin instrument boom.
export function buildCraft() {
  sharedPanel = sharedPanel || panelTexture();
  const g = new Group();
  const foil = new MeshStandardMaterial({ color: 0xc9a55a, metalness: 0.95, roughness: 0.28 });
  const metal = new MeshStandardMaterial({ color: 0xdfe3ea, metalness: 0.9, roughness: 0.22 });
  const wing = new MeshStandardMaterial({ map: sharedPanel, metalness: 0.6, roughness: 0.25, side: DoubleSide });

  const bus = new Mesh(new BoxGeometry(0.06, 0.05, 0.05), foil);
  g.add(bus);
  [-1, 1].forEach((s) => {
    const arm = new Mesh(new CylinderGeometry(0.003, 0.003, 0.04, 6), metal);
    arm.rotation.z = Math.PI / 2;
    arm.position.x = s * 0.05;
    const panel = new Mesh(new BoxGeometry(0.11, 0.002, 0.045), wing);
    panel.position.x = s * 0.125;
    g.add(arm, panel);
  });
  // Dish: a shallow bowl turned on a lathe.
  const pts = [];
  for (let i = 0; i <= 10; i += 1) {
    const r = (i / 10) * 0.04;
    pts.push(new Vector2(r, (r * r) / 0.06));
  }
  const dish = new Mesh(new LatheGeometry(pts, 24), new MeshStandardMaterial({ color: 0xf4f6fa, metalness: 0.7, roughness: 0.3, side: DoubleSide }));
  dish.position.y = 0.045;
  const mast = new Mesh(new CylinderGeometry(0.003, 0.003, 0.02, 6), metal);
  mast.position.y = 0.03;
  const feed = new Mesh(new CylinderGeometry(0.002, 0.002, 0.03, 6), metal);
  feed.position.y = 0.06;
  const boom = new Mesh(new CylinderGeometry(0.0015, 0.0015, 0.09, 4), metal);
  boom.rotation.x = Math.PI / 2;
  boom.position.z = -0.07;
  g.add(dish, mast, feed, boom);
  return g;
}

// A landing-site beacon: a glowing dot on a short stem.
export function buildBeacon() {
  const g = new Group();
  const dot = new Mesh(new SphereGeometry(0.022, 16, 12), new MeshBasicMaterial({ color: 0xffffff }));
  dot.position.y = 0.045;
  const halo = new Mesh(new SphereGeometry(0.045, 16, 12), new MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.35, blending: AdditiveBlending, depthWrite: false }));
  halo.position.y = 0.045;
  const stem = new Mesh(new CylinderGeometry(0.003, 0.003, 0.045, 6), new MeshBasicMaterial({ color: 0xcbd5e1 }));
  stem.position.y = 0.022;
  g.add(stem, dot, halo);
  g.userData.halo = halo;
  return g;
}

export function buildLabel(text) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = '600 30px "IBM Plex Sans", system-ui, sans-serif';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 16;
  c.width = w;
  c.height = 46;
  // A callout like the 2D labels: plain text on a short leader line,
  // outlined in black so it reads over stars and planet alike.
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2, 46);
  ctx.lineTo(w / 2, 36);
  ctx.stroke();
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.strokeText(text, w / 2, 18);
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(text, w / 2, 18);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  const s = new Sprite(new SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  const h = 0.075;
  s.scale.set((h * w) / 46, h, 1);
  s.center.set(0.5, -0.3);
  s.renderOrder = 20;
  return s;
}

// Planetocentric latitude / east longitude to a point on the unit sphere,
// matching three.js sphere UVs for an equirectangular map centered on 0°.
export function siteVector(lat, lon) {
  const phi = (lat * Math.PI) / 180;
  const u = (lon + 180) / 360;
  const a = u * Math.PI * 2;
  return new Vector3(-Math.cos(a) * Math.cos(phi), Math.sin(phi), Math.sin(a) * Math.cos(phi));
}

function ellipse(a, b, color, opacity) {
  const pts = [];
  for (let i = 0; i < 128; i += 1) {
    const t = (i / 128) * Math.PI * 2;
    pts.push(Math.cos(t) * a, 0, Math.sin(t) * b);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return new LineLoop(g, new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
}

// Deep-space directions match the 2D map.
const DEEP_ANGLE = { 'voyager-1': -58, 'voyager-2': 138, 'pioneer-10': 22, 'pioneer-11': 205, 'new-horizons': 92 };

export function createRobotLayer({ robots, spinner, system, envMap }) {
  const items = [];
  const orbitLines = new Group();
  system.add(orbitLines);
  let orbitIndex = 0;
  let flybyIndex = 0;

  robots.forEach((r) => {
    const label = buildLabel(r.name);
    let obj;
    if (r.place === 'surface') {
      obj = buildBeacon();
      const v = siteVector(r.site[0], r.site[1]);
      obj.position.copy(v);
      obj.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), v);
      spinner.add(obj);
      label.center.set(0.5, -0.9);
      obj.add(label);
      label.visible = false;
    } else {
      obj = buildCraft();
      // Reflections only on the robots, so the planets keep a sharp night side.
      obj.traverse((o) => {
        if (o.isMesh) {
          o.material = o.material.clone();
          o.material.envMap = envMap;
          o.material.envMapIntensity = 1.2;
        }
      });
      system.add(obj);
      obj.add(label);
      if (r.place === 'orbit') {
        const a = 1.42 + orbitIndex * 0.22;
        obj.userData.orbit = { a, b: a * 0.94, incl: 0.25 - orbitIndex * 0.35, phase: orbitIndex * 2.1, speed: 0.32 / Math.pow(a, 1.5) };
        const line = ellipse(a, a * 0.94, 0x2563eb, 0.45);
        line.rotation.x = obj.userData.orbit.incl;
        orbitLines.add(line);
        obj.userData.line = line;
        orbitIndex += 1;
      } else if (r.place === 'flyby') {
        obj.userData.flyby = { offset: 1.35 + (flybyIndex % 3) * 0.2, phase: flybyIndex * 0.37, tilt: (flybyIndex % 2 ? -1 : 1) * 0.35 };
        flybyIndex += 1;
      } else {
        const ang = ((DEEP_ANGLE[r.id] || 0) * Math.PI) / 180;
        const dist = 0.55 + Math.log10(Math.max(1, r.au || 50)) * 0.7;
        obj.position.set(Math.cos(ang) * dist, 0.12 * Math.sin(ang * 3), Math.sin(ang) * dist);
        obj.scale.setScalar(1.6);
      }
    }
    obj.userData.robotId = r.id;
    obj.userData.place = r.place;
    obj.userData.hover = 0;
    obj.userData.label = label;
    obj.traverse((o) => {
      if (o.isMesh) {
        o.userData.kind = 'robot';
        o.userData.root = obj;
      }
    });
    items.push(obj);
  });

  const tmp = new Vector3();
  const camDir = new Vector3();

  function update(clock, dt, hovered, selected, camera, overlay) {
    for (const obj of items) {
      const d = obj.userData;
      if (d.orbit) {
        const o = d.orbit;
        const ang = o.phase + clock * o.speed;
        const p = new Vector3(Math.cos(ang) * o.a, 0, Math.sin(ang) * o.b);
        p.applyAxisAngle(new Vector3(1, 0, 0), o.incl);
        obj.position.copy(p);
        obj.lookAt(0, 0, 0);
      } else if (d.flyby) {
        // One pass every 26 seconds: in from one side, past the planet, out.
        const f = d.flyby;
        const u = ((clock / 26 + f.phase) % 1) * 2 - 1; // -1 .. 1
        const x = u * 3.4;
        obj.position.set(x, Math.sin(f.tilt) * f.offset * 0.4 - x * 0.08, f.offset);
        obj.visible = Math.abs(x) < 3.2;
        obj.rotation.set(0.3, clock * 0.2, 0);
      } else if (d.place === 'outbound') {
        obj.rotation.y += dt * 0.3;
      }
      const target = obj === hovered || obj === selected ? 1 : 0;
      d.hover += (target - d.hover) * Math.min(1, dt * 10);
      const base = d.place === 'outbound' ? 1.6 : 1;
      if (d.place === 'surface') {
        obj.scale.setScalar(1 + d.hover * 0.8);
        // Labels on landing sites only for the one being looked at.
        obj.getWorldPosition(tmp);
        camera.getWorldDirection(camDir);
        const facing = tmp.clone().normalize().dot(camDir.clone().negate()) > 0.15;
        d.label.visible = overlay.labels && facing && (obj === hovered || obj === selected);
        if (d.halo) d.halo.material.opacity = 0.3 + 0.25 * Math.sin(clock * 3 + obj.id);
      } else {
        obj.scale.setScalar(base * (1 + d.hover * 0.5));
        d.label.visible = overlay.labels;
      }
    }
    // A robot's path shows only while it is pointed at or picked.
    for (const obj of items) {
      if (obj.userData.line) obj.userData.line.visible = overlay.orbits && (obj === hovered || obj === selected);
    }
  }

  const pickables = [];
  items.forEach((obj) => obj.traverse((o) => o.isMesh && pickables.push(o)));
  return { items, update, pickables, orbitLines };
}
