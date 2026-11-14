// The 3D view. Loaded only when a visitor switches to 3D, so the first
// page load never pays for three.js.
import {
  AdditiveBlending,
  AmbientLight,
  BackSide,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PMREMGenerator } from 'three';
import { ringCanvas } from '../lib/drawn.js';
import { createRobotLayer } from './robots3d.js';

// The canvas is 2.4 times the planet's width so rings and orbits fit.
const VIEW_HALF = 2.4;
const FOV = 30;
const CAMERA_Z = VIEW_HALF / Math.tan(((FOV / 2) * Math.PI) / 180);
// Sunlight comes from the upper left and slightly behind, so the right side
// of each world falls into night with a soft terminator.
const SUN_DIR = new Vector3(-1, 0.35, 0.55).normalize();

let renderer; // one WebGL context, moved between slides
let owner = null; // the mount that currently holds the canvas

function getRenderer() {
  if (!renderer) {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = SRGBColorSpace;
  }
  return renderer;
}

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = 4;
        resolve(t);
      },
      undefined,
      () => reject(new Error('texture failed to load'))
    );
  });
}

// ---------- Atmosphere: a Fresnel rim, brighter on the sunlit side ----------

function buildAtmosphere(color, strength) {
  const mat = new ShaderMaterial({
    uniforms: {
      glow: { value: new Color(color) },
      sunDir: { value: SUN_DIR.clone() },
      strength: { value: strength },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 glow;
      uniform vec3 sunDir;
      uniform float strength;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = 1.0 - max(dot(vNormal, vView), 0.0);
        float fres = pow(rim, 3.2);
        float lit = smoothstep(-0.35, 0.6, dot(vNormal, sunDir));
        gl_FragColor = vec4(glow * fres * (0.25 + lit) * strength, fres * strength);
      }`,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: BackSide,
  });
  const mesh = new Mesh(new SphereGeometry(1.06, 64, 48), mat);
  mesh.userData.kind = 'atmosphere';
  return mesh;
}

// ---------- Saturn's rings: banded, with the Cassini Division, the
// planet's shadow and grains that drift faster near the planet ----------

function buildRings() {
  const inner = 1.24;
  const outer = 2.27;
  const geo = new RingGeometry(inner, outer, 256, 4);
  const map = new CanvasTexture(ringCanvas());
  map.colorSpace = SRGBColorSpace;
  const mat = new ShaderMaterial({
    uniforms: {
      map: { value: map },
      inner: { value: inner },
      outer: { value: outer },
      sunDir: { value: SUN_DIR.clone() },
      planetR: { value: 1 },
      time: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vLocal;
      varying vec3 vWorld;
      void main() {
        vLocal = position.xy;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform float inner;
      uniform float outer;
      uniform vec3 sunDir;
      uniform float planetR;
      uniform float time;
      varying vec2 vLocal;
      varying vec3 vWorld;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        float r = length(vLocal);
        float u = (r - inner) / (outer - inner);
        vec4 band = texture2D(map, vec2(u, 0.5));
        // Keplerian drift: inner grains go round faster.
        float ang = atan(vLocal.y, vLocal.x) + time * 0.35 / pow(r, 1.5);
        float grain = hash(vec2(floor(ang * 90.0), floor(r * 120.0)));
        float clump = hash(vec2(floor(ang * 22.0), floor(r * 40.0)));
        vec3 col = band.rgb * (0.94 + grain * 0.08) * (0.92 + clump * 0.1);
        // Shadow of the planet: does the path to the Sun cross the globe?
        float t = -dot(vWorld, sunDir);
        vec3 closest = vWorld + sunDir * t;
        float shadow = (t > 0.0) ? 1.0 - smoothstep(planetR * 0.93, planetR * 1.02, length(closest)) : 0.0;
        col *= mix(1.0, 0.12, shadow);
        gl_FragColor = vec4(col, band.a);
      }`,
    transparent: true,
    side: DoubleSide,
    depthWrite: false,
  });
  const mesh = new Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.userData.kind = 'rings';

  // Loose sparkling particles that orbit with the rings.
  const rnd = seeded(77);
  const n = 1800;
  const pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i += 1) {
    let r = inner + rnd() * (outer - inner);
    if (r > 1.88 && r < 1.96) r += 0.1; // keep the Cassini gap empty
    const a = rnd() * Math.PI * 2;
    pts[i * 3] = Math.cos(a) * r;
    pts[i * 3 + 1] = (rnd() - 0.5) * 0.01;
    pts[i * 3 + 2] = Math.sin(a) * r;
  }
  const pg = new BufferGeometry();
  pg.setAttribute('position', new Float32BufferAttribute(pts, 3));
  const sparkle = new Points(pg, new PointsMaterial({ color: 0xf2ead8, size: 0.012, transparent: true, opacity: 0.55, depthWrite: false }));
  sparkle.userData.kind = 'sparkle';
  return { mesh, sparkle, material: mat };
}

// Uranus: thin, dark, narrow rings.
function buildThinRings() {
  const g = new Group();
  [1.64, 1.68, 1.72, 1.78, 2.0].forEach((r, i) => {
    const w = i === 4 ? 0.025 : 0.008;
    const m = new Mesh(new RingGeometry(r, r + w, 160, 1), new MeshBasicMaterial({ color: 0x9aa4b2, transparent: true, opacity: i === 4 ? 0.45 : 0.3, side: DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    g.add(m);
  });
  return g;
}

// ---------- Rocks: low-poly, irregular, each spinning on its own axis ----------

function rockGeometry(seed) {
  const geo = new IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  const rnd = seeded(seed);
  const bumps = Array.from({ length: 5 }, () => [new Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), 0.15 + rnd() * 0.3]);
  const v = new Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i).normalize();
    let k = 1;
    for (const [dir, amt] of bumps) k -= Math.max(0, v.dot(dir) - 0.55) * amt * 2.2;
    // Same corner, same displacement, so the faces stay closed.
    const h = Math.sin(v.x * 12.9 + v.y * 78.2 + v.z * 37.7) * 0.5 + 0.5;
    k *= 0.85 + h * 0.25;
    pos.setXYZ(i, v.x * k, v.y * k * 0.8, v.z * k);
  }
  geo.computeVertexNormals();
  return geo;
}

function buildAsteroids(count, minR, maxR, icy, seed) {
  const rnd = seeded(seed);
  const geos = [rockGeometry(3), rockGeometry(9), rockGeometry(15)];
  const group = new Group();
  const items = [];
  for (let i = 0; i < count; i += 1) {
    const shade = icy ? 0.6 + rnd() * 0.3 : 0.32 + rnd() * 0.25;
    const tint = icy ? new Color(shade * 0.85, shade * 0.92, shade) : new Color(shade * 1.05, shade * 0.95, shade * 0.85);
    const mat = new MeshStandardMaterial({ color: tint, roughness: 0.95, metalness: 0.05, flatShading: true, emissive: 0x1e90ff, emissiveIntensity: 0 });
    const mesh = new Mesh(geos[i % geos.length], mat);
    const size = 0.03 + Math.pow(rnd(), 2) * 0.07;
    mesh.scale.setScalar(size);
    mesh.userData = {
      kind: 'asteroid',
      a: minR + rnd() * (maxR - minR),
      e: 0.04 + rnd() * 0.12,
      phase: rnd() * Math.PI * 2,
      incl: (rnd() - 0.5) * 0.12,
      spin: new Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(),
      spinSpeed: 0.4 + rnd() * 1.6,
      size,
      hover: 0,
    };
    group.add(mesh);
    items.push(mesh);
  }
  return { group, items };
}

// ---------- A highlight ring that faces the camera ----------

function buildHighlight() {
  const mat = new ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vec2 scale = vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
        mv.xy += position.xy * scale;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float time;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float ring = smoothstep(0.78, 0.86, d) * (1.0 - smoothstep(0.9, 1.0, d));
        float pulse = 0.6 + 0.4 * sin(time * 4.0);
        float sweep = 0.5 + 0.5 * sin(atan(vUv.y - 0.5, vUv.x - 0.5) * 3.0 - time * 3.0);
        vec3 col = mix(vec3(0.12, 0.56, 1.0), vec3(1.0), sweep * 0.5);
        gl_FragColor = vec4(col, ring * pulse);
      }`,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    depthTest: false,
  });
  const m = new Mesh(new PlaneGeometry(2, 2), mat);
  m.visible = false;
  m.renderOrder = 10;
  return m;
}

function buildDeepStars() {
  const n = 1600;
  const pts = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  const rnd = seeded(11);
  const palette = [new Color('#cfe3ff'), new Color('#ffffff'), new Color('#fff1dc'), new Color('#9fc2ff')];
  for (let i = 0; i < n; i += 1) {
    const u = rnd() * 2 - 1;
    const a = rnd() * Math.PI * 2;
    const r = 0.25 + Math.cbrt(rnd()) * 0.85;
    const q = Math.sqrt(1 - u * u);
    pts[i * 3] = Math.cos(a) * q * r;
    pts[i * 3 + 1] = u * r * 0.6;
    pts[i * 3 + 2] = Math.sin(a) * q * r;
    const c = palette[Math.floor(rnd() * palette.length)];
    colors.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pts, 3));
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const stars = new Points(geo, new PointsMaterial({ size: 0.022, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.95 }));
  // The Sun, a soft glow at the center that can be picked.
  const sun = new Mesh(
    new SphereGeometry(0.12, 32, 16),
    new MeshBasicMaterial({ color: 0xffffff })
  );
  sun.userData.kind = 'planet';
  const halo = new Mesh(
    new PlaneGeometry(1.2, 1.2),
    new ShaderMaterial({
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(0.,0.,0.,1.); mv.xy+=position.xy; gl_Position=projectionMatrix*mv; }',
      fragmentShader: 'varying vec2 vUv; void main(){ float d=length(vUv-.5)*2.; float g=pow(max(0.,1.-d),3.); gl_FragColor=vec4(vec3(.75,.88,1.)*g, g); }',
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    })
  );
  const g = new Group();
  g.add(stars, sun, halo);
  return { group: g, pickable: sun };
}

const ATMO = {
  venus: ['#f3e3b8', 1.15],
  mars: ['#f0a07a', 0.7],
  jupiter: ['#e8dcc0', 0.75],
  saturn: ['#f0e0b4', 0.7],
  uranus: ['#a6f0f5', 1.0],
  neptune: ['#6aa8ff', 1.1],
  moon: ['#9fb4d8', 0.18],
  mercury: ['#9fb4d8', 0.18],
};

const easeOut = (x) => 1 - Math.pow(1 - x, 3);

export async function mountPlanet(host, body, textureUrl, options = {}) {
  const gl = getRenderer();
  const canvas = gl.domElement;
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, CAMERA_Z * 1.8);

  const view = new Group(); // tips toward the viewer; drag changes it
  const axis = new Group(); // the planet's axial tilt
  const system = new Group(); // asteroids, robot, orbit lines
  view.add(axis, system);
  scene.add(view);

  const pmrem = new PMREMGenerator(gl);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const sun = new DirectionalLight(0xffffff, 3.4);
  sun.position.copy(SUN_DIR).multiplyScalar(6);
  scene.add(sun, new AmbientLight(0x6f86b8, 0.06), new HemisphereLight(0x9cc4ff, 0x05070d, 0.08));

  let spinner;
  let atmosphere;
  let ringParts;
  const pickables = [];

  if (body.deep) {
    const deep = buildDeepStars();
    spinner = deep.group;
    axis.add(spinner);
    pickables.push(deep.pickable);
    view.rotation.x = 0.35;
  } else {
    const map = await loadTexture(textureUrl);
    const rocky = ['mercury', 'venus', 'moon', 'mars'].includes(body.id);
    const mat = new MeshStandardMaterial({
      map,
      roughness: rocky ? 0.95 : 0.85,
      metalness: 0,
      bumpMap: rocky ? map : null,
      bumpScale: rocky ? 2.2 : 0,
      envMapIntensity: 0,
    });
    spinner = new Mesh(new SphereGeometry(1, 96, 64), mat);
    spinner.userData.kind = 'planet';
    axis.add(spinner);
    pickables.push(spinner);
    const [glow, strength] = ATMO[body.id] || ['#9fb4d8', 0.3];
    atmosphere = buildAtmosphere(glow, strength);
    axis.add(atmosphere);
    if (body.rings) {
      ringParts = buildRings();
      axis.add(ringParts.mesh, ringParts.sparkle);
    }
    if (body.id === 'uranus') axis.add(buildThinRings());
    axis.rotation.z = -body.tilt;
    view.rotation.x = body.rings ? 0.32 : 0.14;
  }

  // Rocks only where they really are: the asteroid belt between Mars and
  // Jupiter, and icy Kuiper Belt objects in deep space. They drift far
  // behind the planet instead of circling it.
  const beltWorld = ['mars', 'jupiter'].includes(body.id);
  const rocks = buildAsteroids(beltWorld ? 7 : body.deep ? 9 : 0, 2.1, 2.5, body.deep, body.id.length * 31);
  system.add(rocks.group);
  rocks.items.forEach((m) => {
    m.userData.drift = true;
    pickables.push(m);
  });
  system.rotation.x = 0.08;
  system.rotation.z = 0.12;

  const robotLayer = createRobotLayer({ robots: options.robots || [], spinner, system, view, envMap: envTex });
  robotLayer.pickables.forEach((m) => pickables.push(m));

  const highlight = buildHighlight();
  scene.add(highlight);

  // A mount that was cancelled while its texture loaded must not take the canvas.
  if (options.isCancelled && options.isCancelled()) return { dispose() {}, setPaused() {}, setOverlay() {} };
  const token = {};
  owner = token;
  host.appendChild(canvas);

  let paused = false;
  let dragging = null;
  let frame = 0;
  let last = performance.now();
  let disposed = false;
  let clock = 0;
  const born = performance.now();
  const parallax = { x: 0, y: 0, tx: 0, ty: 0 };
  let hovered = null;
  let selected = null;
  let planetScale = 1;
  let overlay = { orbits: true, belt: true, atmosphere: true, labels: true, ...(options.overlay || {}) };

  const applyOverlay = () => {
    rocks.group.visible = overlay.belt;
    if (atmosphere) atmosphere.visible = overlay.atmosphere;
    if (selected && selected.userData.kind === 'asteroid' && !overlay.belt) selected = null;
  };
  applyOverlay();

  const resize = () => {
    if (owner !== token) return;
    const size = Math.max(1, Math.round(host.clientWidth * VIEW_HALF));
    gl.setSize(size, size, false);
  };
  const ro = new ResizeObserver(() => {
    resize();
    draw();
  });
  ro.observe(host);

  function draw() {
    if (!disposed && owner === token) gl.render(scene, camera);
  }

  const raycaster = new Raycaster();
  const ndc = new Vector2();
  function hit(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return null;
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const list = pickables.filter((o) => o.visible && (o.userData.kind !== 'asteroid' || overlay.belt));
    const hits = raycaster.intersectObjects(list, false);
    if (!hits.length) {
      // Small rocks are hard to tap: accept a near miss.
      if (!overlay.belt) return null;
      let best = null;
      let bestD = 0.06;
      const p = new Vector3();
      for (const m of rocks.items) {
        m.getWorldPosition(p).project(camera);
        const d = Math.hypot(p.x - ndc.x, p.y - ndc.y);
        if (d < bestD) {
          bestD = d;
          best = m;
        }
      }
      return best;
    }
    const o = hits[0].object;
    return o.userData.root || o;
  }

  function tick(t) {
    frame = 0;
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    const moving = !paused;
    if (moving) clock += dt;
    if (moving && !dragging) spinner.rotation.y += dt * (body.deep ? 0.04 : 0.12);

    // Cinematic arrival: the camera glides in from far away.
    const arrive = Math.min(1, (t - born) / 1400);
    parallax.x += (parallax.tx - parallax.x) * Math.min(1, dt * 4);
    parallax.y += (parallax.ty - parallax.y) * Math.min(1, dt * 4);
    const z = CAMERA_Z * (1 + 0.8 * (1 - easeOut(arrive)));
    camera.position.set(parallax.x * 0.35, -parallax.y * 0.25 + (1 - easeOut(arrive)) * 0.6, z);
    camera.lookAt(0, 0, 0);

    for (const m of rocks.items) {
      // Slow drift far behind the planet, wrapping around.
      const dd = m.userData;
      const x = ((dd.phase / (Math.PI * 2)) * 6 + clock * 0.03 * (1 + dd.e * 4)) % 6 - 3;
      m.position.set(x, (dd.a - 2.3) * 3 + dd.incl * 4, -1.6 - dd.e * 4);
      const d = m.userData;
      if (moving) m.rotateOnAxis(d.spin, dt * d.spinSpeed);
      const target = m === hovered || m === selected ? 1 : 0;
      d.hover += (target - d.hover) * Math.min(1, dt * 10);
      m.scale.setScalar(d.size * (1 + d.hover * 0.9));
      m.material.emissiveIntensity = d.hover * 0.6;
    }
    robotLayer.update(clock, dt, hovered, selected, camera, overlay);

    const planetTarget = hovered && hovered.userData.kind === 'planet' ? 1.04 : 1;
    planetScale += (planetTarget - planetScale) * Math.min(1, dt * 8);
    axis.scale.setScalar(planetScale);
    if (ringParts) {
      ringParts.material.uniforms.time.value = clock;
      ringParts.material.uniforms.planetR.value = planetScale;
      ringParts.sparkle.rotation.y += moving ? dt * 0.05 : 0;
    }

    if (selected) {
      const p = new Vector3();
      let s;
      if (selected.userData.kind === 'planet') {
        selected.getWorldPosition(p);
        s = body.deep ? 0.32 : 1.22 * planetScale;
      } else {
        selected.getWorldPosition(p);
        s = selected.userData.robotId ? (selected.userData.place === 'surface' ? 0.12 : 0.24) : selected.userData.size * 3.2;
      }
      highlight.position.copy(p);
      highlight.scale.set(s, s, 1);
      highlight.visible = true;
      highlight.material.uniforms.time.value = t / 1000;
    } else {
      highlight.visible = false;
    }

    draw();
    const settling = arrive < 1 || Math.abs(parallax.tx - parallax.x) + Math.abs(parallax.ty - parallax.y) > 0.001 || Math.abs(planetScale - planetTarget) > 0.001;
    if (!paused || dragging || settling || selected || hovered) frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (!frame && !disposed) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  const onWindowPointer = (e) => {
    parallax.tx = (e.clientX / window.innerWidth) * 2 - 1;
    parallax.ty = (e.clientY / window.innerHeight) * 2 - 1;
    wake();
  };

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    host.dataset.dragged = '';
    wake();
  };
  const onMove = (e) => {
    if (dragging && e.pointerId === dragging.id) {
      const dx = e.clientX - dragging.x;
      const dy = e.clientY - dragging.y;
      if (!dragging.moved && Math.hypot(dx, dy) < 6) return;
      if (!dragging.moved) host.setPointerCapture(e.pointerId);
      dragging.moved = true;
      dragging.x = e.clientX;
      dragging.y = e.clientY;
      const k = 3.2 / Math.max(120, host.clientWidth);
      spinner.rotation.y += dx * k;
      view.rotation.x = Math.max(-0.9, Math.min(0.9, view.rotation.x + dy * k));
      return;
    }
    if (e.pointerType === 'mouse') {
      const h = hit(e.clientX, e.clientY);
      if (h !== hovered) {
        hovered = h;
        host.style.cursor = h ? 'pointer' : 'grab';
        wake();
      }
    }
  };
  const onUp = (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    if (dragging.moved) host.dataset.dragged = '1';
    dragging = null;
    wake();
  };
  const onLeave = () => {
    if (hovered) {
      hovered = null;
      host.style.cursor = '';
      wake();
    }
  };

  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onUp);
  host.addEventListener('pointerleave', onLeave);
  window.addEventListener('pointermove', onWindowPointer, { passive: true });

  resize();
  wake();

  return {
    setPaused(next) {
      paused = next;
      wake();
    },
    setOverlay(next) {
      overlay = { ...overlay, ...next };
      applyOverlay();
      wake();
    },
    // What sits under a click: { kind: 'planet' | 'asteroid' | 'robot', id } or null.
    pick(clientX, clientY) {
      const h = hit(clientX, clientY);
      selected = h;
      wake();
      if (!h) return null;
      if (h.userData.robotId) return { kind: 'robot', id: h.userData.robotId };
      return { kind: h.userData.kind };
    },
    clearPick() {
      selected = null;
      wake();
    },
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onUp);
      host.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointermove', onWindowPointer);
      host.style.cursor = '';
      if (owner === token) {
        owner = null;
        if (canvas.parentNode === host) host.removeChild(canvas);
      }
      delete host.__planet3d;
      envTex.dispose();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          if (o.material.uniforms && o.material.uniforms.map) o.material.uniforms.map.value.dispose();
          if (o.material.map && o.isSprite) o.material.map.dispose();
          o.material.dispose();
        }
      });
    },
  };
}
