import { useEffect, useMemo, useRef, useState } from 'react';
import DeepSpaceMap from './DeepSpaceMap.jsx';
import { uranusTexture } from '../lib/drawn.js';
import { distanceNow, robotsFor } from '../data/robots.js';
import { SITES, placement, shortName } from '../data/orbits.js';

export function textureUrl(body) {
  if (body.texture) return `${import.meta.env.BASE_URL}${body.texture}`;
  if (body.drawn === 'uranus') return uranusTexture();
  return null;
}

function Rings({ part, thin }) {
  // Drawn twice: the far half sits behind the globe, the near half in front.
  if (thin) {
    // Uranus: a few narrow, dark rings.
    return (
      <svg className={`rings rings--thin rings--${part}`} viewBox="-120 -40 240 80" aria-hidden="true">
        <ellipse rx="86" ry="23" className="ring ring--thin" />
        <ellipse rx="80" ry="21.4" className="ring ring--thin" />
        <ellipse rx="76" ry="20.3" className="ring ring--thin" />
      </svg>
    );
  }
  // Saturn. The dark band between B and A is the Cassini Division.
  return (
    <svg className={`rings rings--${part}`} viewBox="-120 -40 240 80" aria-hidden="true">
      <ellipse rx="112" ry="30" className="ring ring--a" />
      <ellipse rx="103.5" ry="27.6" className="ring ring--gap" />
      <ellipse rx="94" ry="25" className="ring ring--b" />
      <ellipse rx="78" ry="20.5" className="ring ring--c" />
    </svg>
  );
}

function CraftIcon() {
  // Solar wings with cells, a foil bus, and a parabolic dish.
  return (
    <svg viewBox="-16 -10 32 20" width="30" height="19" aria-hidden="true">
      <defs>
        <linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2d58b" />
          <stop offset="0.5" stopColor="#b98d3d" />
          <stop offset="1" stopColor="#6b4f1f" />
        </linearGradient>
        <linearGradient id="cell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b6fd8" />
          <stop offset="1" stopColor="#0b1f4d" />
        </linearGradient>
      </defs>
      <rect x="-15" y="-2.5" width="9" height="5" fill="url(#cell)" stroke="#cbd5e1" strokeWidth="0.4" />
      <rect x="6" y="-2.5" width="9" height="5" fill="url(#cell)" stroke="#cbd5e1" strokeWidth="0.4" />
      <path d="M-12 -2.5v5M-9 -2.5v5M9 -2.5v5M12 -2.5v5" stroke="#cbd5e1" strokeWidth="0.3" />
      <line x1="-6" y1="0" x2="-3.5" y2="0" stroke="#cbd5e1" strokeWidth="0.6" />
      <line x1="3.5" y1="0" x2="6" y2="0" stroke="#cbd5e1" strokeWidth="0.6" />
      <rect x="-3.5" y="-3" width="7" height="6.5" rx="0.6" fill="url(#foil)" />
      <line x1="0" y1="-3" x2="0" y2="-5" stroke="#cbd5e1" strokeWidth="0.6" />
      <path d="M-4.5 -5.2 Q0 -9.6 4.5 -5.2 Z" fill="#f4f6fa" stroke="#9aa4b2" strokeWidth="0.3" />
    </svg>
  );
}

const ROCKS = [
  { y: -0.42, speed: 0.018, phase: 0.1, size: 13, points: '0,-7 6,-4 8,2 3,7 -4,6 -8,1 -6,-5' },
  { y: 0.36, speed: 0.012, phase: 0.62, size: 10, points: '-1,-7 6,-5 7,3 1,7 -6,5 -7,-2' },
];

// Astronaut "Inspect Orbit Path" in 2D: the same ellipses and lines the
// robots below travel along. One SVG unit is 1% of the planet's width (cqw).
function OrbitPaths({ robots, rx, part }) {
  let oi = 0;
  let fi = 0;
  const shapes = [];
  robots.forEach((r) => {
    if (r.place === 'orbit') {
      const a = rx + oi * 14;
      shapes.push(<ellipse key={r.id} rx={a} ry={a * (0.22 + oi * 0.05)} className="path-orbit" />);
      oi += 1;
    } else if (r.place === 'flyby') {
      const y = 52 + (fi % 3) * 13;
      if (part === 'front') shapes.push(<line key={r.id} x1="-170" y1={y + 8} x2="170" y2={y - 8} className="path-flyby" />);
      fi += 1;
    }
  });
  return (
    <svg className={`orbit-paths orbit-paths--${part}`} viewBox="-200 -200 400 400" aria-hidden="true">
      {shapes}
    </svg>
  );
}

// The robots of this world in the 2D view: orbiters circle the globe,
// flybys cross the scene, and rocks drift far behind (belt worlds only).
function SpaceObjects({ robots, paused, belt, labels, rocks, onPick, rx }) {
  const refs = useRef({});
  const flying = useMemo(() => robots.filter((r) => r.place === 'orbit' || r.place === 'flyby'), [robots]);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let t = 0;
    const place = () => {
      let oi = 0;
      let fi = 0;
      flying.forEach((r) => {
        const el = refs.current[r.id];
        if (!el) return;
        if (r.place === 'orbit') {
          const a = rx + oi * 14;
          const ang = oi * 2.3 + t * (0.18 / (1 + oi * 0.4));
          const x = Math.cos(ang) * a;
          const y = Math.sin(ang) * a * (0.22 + oi * 0.05);
          const front = Math.sin(ang) > 0;
          const depth = 0.8 + (Math.sin(ang) + 1) * 0.15;
          el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}cqw, ${y.toFixed(2)}cqw) scale(${depth.toFixed(3)})`;
          el.style.zIndex = front ? 6 : 0;
          oi += 1;
        } else {
          // A flyby crosses once every 26 seconds, then is gone for a while.
          const u = ((t / 26 + fi * 0.37) % 1) * 2 - 1;
          const x = u * 170;
          const y = 52 + (fi % 3) * 13 - u * 8;
          el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}cqw, ${y.toFixed(2)}cqw)`;
          el.style.opacity = Math.abs(u) > 0.92 ? 0 : 1;
          el.style.zIndex = 6;
          fi += 1;
        }
      });
      ROCKS.forEach((k, i) => {
        const el = refs.current[`rock${i}`];
        if (!el) return;
        const x = (((k.phase + t * k.speed) % 1) * 2 - 1) * 160;
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}cqw, ${(k.y * 100).toFixed(1)}cqw)`;
        el.style.setProperty('--spin', `${(t * 25 * (i + 1)) % 360}deg`);
      });
    };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      place();
      frame = requestAnimationFrame(tick);
    };
    place();
    if (!paused) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, rx, flying]);

  return (
    <>
      {rocks &&
        belt &&
        ROCKS.map((k, i) => (
          <button
            key={i}
            type="button"
            className="orbiter orbiter--rock"
            ref={(el) => {
              refs.current[`rock${i}`] = el;
            }}
            aria-label="Asteroid: open its fact card"
            onClick={() => onPick('asteroid')}
          >
            <svg viewBox="-9 -9 18 18" width={k.size} height={k.size} aria-hidden="true">
              <defs>
                <linearGradient id={`rock${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#b9b4ad" />
                  <stop offset="1" stopColor="#2f2f35" />
                </linearGradient>
              </defs>
              <polygon points={k.points} fill={`url(#rock${i})`} />
            </svg>
          </button>
        ))}
      {flying.map((r) => (
        <button
          key={r.id}
          type="button"
          className={`orbiter orbiter--craft orbiter--${r.place}`}
          ref={(el) => {
            refs.current[r.id] = el;
          }}
          aria-label={`${r.name}: learn about this robot`}
          onClick={() => onPick('robot', r.id)}
        >
          <CraftIcon />
          {labels && <span className="craft-label">{r.name}</span>}
        </button>
      ))}
    </>
  );
}

// Landing-site beacons that turn with the planet. The 2D globe scrolls a
// flat map, so a site's place on the disc follows the same scroll exactly.
const DAY = 90; // seconds for one turn of the 2D globe

function Beacons({ robots, paused, surfaceRef, labels }) {
  const refs = useRef({});
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return undefined;
    let frame = 0;
    let last = performance.now();
    let t = 0;
    const place = () => {
      const w = surface.clientWidth;
      const offset = ((t / DAY) % 1) * 2 * w;
      surface.style.backgroundPosition = `${offset.toFixed(1)}px 50%`;
      robots.forEach((r) => {
        const el = refs.current[r.id];
        if (!el) return;
        const [lat, lon] = r.site;
        const u = (lon + 180) / 360;
        let x = (offset + u * 2 * w) % (2 * w);
        if (x > 1.5 * w) x -= 2 * w;
        const visible = x > 0.06 * w && x < 0.94 * w;
        const y = ((90 - lat) / 180) * w;
        el.style.left = `${x.toFixed(1)}px`;
        el.style.top = `${y.toFixed(1)}px`;
        el.style.opacity = visible ? 1 - Math.abs(x / w - 0.5) * 1.2 : 0;
        el.style.visibility = visible ? 'visible' : 'hidden';
      });
    };
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      place();
      frame = requestAnimationFrame(tick);
    };
    place();
    if (!paused) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, robots, surfaceRef]);

  return robots.map((r) => (
    <span
      key={r.id}
      className="beacon"
      data-robot={r.id}
      ref={(el) => {
        refs.current[r.id] = el;
      }}
      title={r.name}
    >
      {labels && <span className="beacon-label">{r.name}</span>}
    </span>
  ));
}

export default function Planet({ body, label, active, mode, paused, now, overlay, picked, inspect, onPick, on3dError }) {
  const hostRef = useRef(null);
  const surfaceRef = useRef(null);
  const [view3d, setView3d] = useState('off'); // off | loading | ready
  const want3d = mode === '3d' && active;
  const url = textureUrl(body);
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;

  const robots = useMemo(
    () =>
      robotsFor(body.id).map((r) => ({
        id: r.id,
        name: shortName(r),
        place: placement(r, body.id),
        site: SITES[r.id],
        au: r.horizons ? distanceNow(r.horizons, Date.now()).au : null,
      })),
    [body.id]
  );
  const surfaceRobots = useMemo(() => robots.filter((r) => r.place === 'surface'), [robots]);

  useEffect(() => {
    if (!want3d) {
      setView3d('off');
      return undefined;
    }
    let cancelled = false;
    let controller;
    setView3d('loading');
    import('../three/planetView.js')
      .then((m) => m.mountPlanet(hostRef.current, body, url, { overlay: overlayRef.current, robots, isCancelled: () => cancelled }))
      .then((c) => {
        if (cancelled) {
          c.dispose();
          return;
        }
        controller = c;
        hostRef.current.__planet3d = c;
        c.setPaused(pausedRef.current);
        setView3d('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setView3d('off');
        on3dError();
      });
    return () => {
      cancelled = true;
      if (controller) controller.dispose();
    };
    // `paused` and `overlay` are applied through their own effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [want3d, body.id]);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
    const c = hostRef.current && hostRef.current.__planet3d;
    if (c && view3d === 'ready') c.setPaused(paused);
  }, [paused, view3d]);

  useEffect(() => {
    const c = hostRef.current && hostRef.current.__planet3d;
    if (c && view3d === 'ready') c.setOverlay(overlay);
  }, [overlay, view3d]);

  useEffect(() => {
    const c = hostRef.current && hostRef.current.__planet3d;
    if (c && view3d === 'ready') c.setInspect(Boolean(inspect));
  }, [inspect, view3d]);

  useEffect(() => {
    const c = hostRef.current && hostRef.current.__planet3d;
    if (c && view3d === 'ready' && !picked) c.clearPick();
  }, [picked, view3d]);

  const handleClick = (e) => {
    const host = hostRef.current;
    // A drag that rotated the 3D globe should not also count as a tap.
    if (host && host.dataset.dragged === '1') {
      host.dataset.dragged = '';
      return;
    }
    const c = host && host.__planet3d;
    if (c && view3d === 'ready') {
      // Keyboard presses have no position: treat them as the planet.
      const hit = e.clientX || e.clientY ? c.pick(e.clientX, e.clientY) : { kind: 'planet' };
      if (hit) onPick(hit.kind, hit.id);
      return;
    }
    const beacon = e.target.closest && e.target.closest('[data-robot]');
    if (beacon) {
      onPick('robot', beacon.dataset.robot);
      return;
    }
    onPick('planet');
  };

  // Uranus is shown on its side; other worlds keep a gentle tilt in 2D.
  const tiltDeg = (body.id === 'uranus' ? body.tilt : Math.min(body.tilt, 0.5)) * (180 / Math.PI);
  const classes = ['planet', `planet--${body.id}`];
  if (view3d === 'ready') classes.push('is-3d');
  if (body.deep) classes.push('planet--deep');
  if (overlay.atmosphere) classes.push('has-atmo');
  if (picked === 'planet' && view3d !== 'ready') classes.push('is-picked');
  const show2dExtras = active && view3d !== 'ready' && !body.deep;
  const beaconsOn = show2dExtras && surfaceRobots.length > 0;
  if (beaconsOn) classes.push('js-spin');
  const thinRings = body.id === 'uranus';
  // Narrower orbits on phones so robots stay clear of the stop dots on the right edge.
  const rx = body.rings ? 128 : window.matchMedia('(max-width: 767px)').matches ? 60 : 78;
  const showPaths = show2dExtras && inspect;

  return (
    <div className={`planet-wrap planet-wrap--${body.id}`} style={{ '--atmo': body.atmo || '#9fb4d8' }}>
      {showPaths && <OrbitPaths robots={robots} rx={rx} part="back" />}
      <button
        ref={hostRef}
        type="button"
        className={classes.join(' ')}
        style={{ '--tilt': `${tiltDeg.toFixed(1)}deg` }}
        aria-label={label}
        onClick={handleClick}
      >
        {(body.rings || thinRings) && <Rings part="back" thin={thinRings} />}
        {body.deep ? (
          <DeepSpaceMap now={now} />
        ) : (
          <span className="globe">
            <span
              ref={surfaceRef}
              className="globe-surface"
              style={{ backgroundImage: url ? `url("${url}")` : 'none', backgroundColor: body.color }}
            >
              {beaconsOn && <Beacons robots={surfaceRobots} paused={paused} surfaceRef={surfaceRef} labels={overlay.labels} />}
            </span>
          </span>
        )}
        {(body.rings || thinRings) && <Rings part="front" thin={thinRings} />}
        {view3d === 'loading' && (
          <span className="planet-note" role="status">
            Loading 3D view
          </span>
        )}
      </button>
      {showPaths && <OrbitPaths robots={robots} rx={rx} part="front" />}
      {show2dExtras && (
        <SpaceObjects
          robots={robots}
          paused={paused}
          belt={overlay.belt}
          labels={overlay.labels || inspect}
          rocks={['mars', 'jupiter'].includes(body.id)}
          onPick={onPick}
          rx={rx}
        />
      )}
      {overlay.labels && (
        <span className="planet-label" aria-hidden="true">
          {body.name}
        </span>
      )}
    </div>
  );
}
