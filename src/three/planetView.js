// The 3D view. Loaded only when a visitor switches to 3D, so the first
// page load never pays for three.js.
import {
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  WebGLRenderer,
} from 'three';
import { ringCanvas } from '../lib/drawn.js';

// The canvas is 2.4 times the planet's width so Saturn's rings fit.
const VIEW_HALF = 2.4;
const FOV = 30;
const CAMERA_Z = VIEW_HALF / Math.tan(((FOV / 2) * Math.PI) / 180);

let renderer; // one WebGL context, moved between slides

function getRenderer() {
  if (!renderer) {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }
  return renderer;
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = SRGBColorSpace;
        resolve(t);
      },
      undefined,
      () => reject(new Error('texture failed to load'))
    );
  });
}

function buildRings() {
  const inner = 1.24;
  const outer = 2.27;
  const geo = new RingGeometry(inner, outer, 128, 1);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i += 1) {
    const r = Math.hypot(pos.getX(i), pos.getY(i));
    uv.setXY(i, (r - inner) / (outer - inner), 0.5);
  }
  const map = new CanvasTexture(ringCanvas());
  map.colorSpace = SRGBColorSpace;
  const mat = new MeshBasicMaterial({ map, transparent: true, side: DoubleSide, depthWrite: false });
  const mesh = new Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function buildStars() {
  const n = 1400;
  const pts = new Float32Array(n * 3);
  let s = 11;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < n; i += 1) {
    const u = rnd() * 2 - 1;
    const a = rnd() * Math.PI * 2;
    const r = 0.25 + Math.cbrt(rnd()) * 0.72;
    const q = Math.sqrt(1 - u * u);
    pts[i * 3] = Math.cos(a) * q * r;
    pts[i * 3 + 1] = u * r;
    pts[i * 3 + 2] = Math.sin(a) * q * r;
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return new Points(geo, new PointsMaterial({ color: 0xdfe4f2, size: 0.022, sizeAttenuation: true, transparent: true, opacity: 0.9 }));
}

export async function mountPlanet(host, body, textureUrl) {
  const gl = getRenderer();
  const canvas = gl.domElement;
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, CAMERA_Z);

  const view = new Group(); // tips toward the viewer; drag changes it
  const axis = new Group(); // the planet's axial tilt
  view.add(axis);
  scene.add(view);

  let spinner;
  if (body.deep) {
    spinner = buildStars();
    axis.add(spinner);
  } else {
    const map = await loadTexture(textureUrl);
    spinner = new Mesh(new SphereGeometry(1, 72, 48), new MeshStandardMaterial({ map, roughness: 1, metalness: 0 }));
    axis.add(spinner);
    if (body.rings) axis.add(buildRings());
    axis.rotation.z = -Math.min(body.tilt, 0.5);
    view.rotation.x = body.rings ? 0.3 : 0.1;
    // Same light direction as the 2D shading: upper left, toward the viewer.
    const sun = new DirectionalLight(0xffffff, 2.8);
    sun.position.set(-3.2, 2.4, 4);
    scene.add(sun, new AmbientLight(0x8090b0, 0.22));
  }

  host.appendChild(canvas);

  let paused = false;
  let dragging = null;
  let frame = 0;
  let last = performance.now();
  let disposed = false;

  const resize = () => {
    const size = Math.max(1, Math.round(host.clientWidth * VIEW_HALF));
    gl.setSize(size, size, false);
  };
  const ro = new ResizeObserver(() => {
    resize();
    draw();
  });
  ro.observe(host);

  function draw() {
    if (!disposed) gl.render(scene, camera);
  }

  function tick(t) {
    frame = 0;
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    if (!paused && !dragging) spinner.rotation.y += dt * (body.deep ? 0.05 : 0.14);
    draw();
    if (!paused || dragging) frame = requestAnimationFrame(tick);
  }

  function wake() {
    if (!frame && !disposed) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    host.setPointerCapture(e.pointerId);
    host.dataset.dragged = '';
    wake();
  };
  const onMove = (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const dx = e.clientX - dragging.x;
    const dy = e.clientY - dragging.y;
    if (!dragging.moved && Math.hypot(dx, dy) < 6) return;
    dragging.moved = true;
    dragging.x = e.clientX;
    dragging.y = e.clientY;
    const k = 3.2 / Math.max(120, host.clientWidth);
    spinner.rotation.y += dx * k;
    view.rotation.x = Math.max(-0.9, Math.min(0.9, view.rotation.x + dy * k));
  };
  const onUp = (e) => {
    if (!dragging || e.pointerId !== dragging.id) return;
    if (dragging.moved) host.dataset.dragged = '1';
    dragging = null;
    wake();
  };

  host.addEventListener('pointerdown', onDown);
  host.addEventListener('pointermove', onMove);
  host.addEventListener('pointerup', onUp);
  host.addEventListener('pointercancel', onUp);

  resize();
  wake();

  return {
    setPaused(next) {
      paused = next;
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
      if (canvas.parentNode === host) host.removeChild(canvas);
      delete host.__planet3d;
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
    },
  };
}
