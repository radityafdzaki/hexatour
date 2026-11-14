import { useEffect, useRef, useState } from 'react';
import DeepSpaceMap from './DeepSpaceMap.jsx';
import { uranusTexture } from '../lib/drawn.js';

export function textureUrl(body) {
  if (body.texture) return `${import.meta.env.BASE_URL}${body.texture}`;
  if (body.drawn === 'uranus') return uranusTexture();
  return null;
}

function Rings({ part }) {
  // Drawn twice: the far half sits behind the globe, the near half in front.
  // The dark band between B and A is the Cassini Division.
  return (
    <svg className={`rings rings--${part}`} viewBox="-120 -40 240 80" aria-hidden="true">
      <ellipse rx="112" ry="30" className="ring ring--a" />
      <ellipse rx="103.5" ry="27.6" className="ring ring--gap" />
      <ellipse rx="94" ry="25" className="ring ring--b" />
      <ellipse rx="78" ry="20.5" className="ring ring--c" />
    </svg>
  );
}

function OrbitPath({ part }) {
  return (
    <svg className={`orbit-path orbit-path--${part}`} viewBox="-100 -30 200 60" aria-hidden="true">
      <ellipse rx="96" ry="22" />
    </svg>
  );
}

const ROCKS = [
  { phase: 0.4, speed: 0.16, size: 15, points: '0,-7 6,-4 8,2 3,7 -4,6 -8,1 -6,-5' },
  { phase: 2.5, speed: 0.12, size: 11, points: '0,-8 5,-6 7,1 4,6 -3,7 -7,2 -5,-5' },
  { phase: 4.3, speed: 0.2, size: 9, points: '-1,-7 6,-5 7,3 1,7 -6,5 -7,-2' },
];

// Rocks and a robot circling the globe in the 2D view. They pass behind the
// planet on the far side of the orbit and in front of it on the near side.
function Orbiters({ paused, belt, onPick, rx }) {
  const refs = useRef([]);
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let t = 0;
    const items = [...ROCKS.map((r) => ({ ...r, kind: 'asteroid' })), { phase: 1.2, speed: 0.1, size: 26, kind: 'craft' }];
    const place = () => {
      items.forEach((it, i) => {
        const el = refs.current[i];
        if (!el) return;
        const a = it.phase + t * it.speed * Math.PI;
        const x = Math.cos(a) * rx;
        const y = Math.sin(a) * rx * 0.23;
        const front = Math.sin(a) > 0;
        const depth = 0.75 + (Math.sin(a) + 1) * 0.18;
        el.style.transform = `translate(-50%, -50%) translate(${x.toFixed(2)}cqw, ${y.toFixed(2)}cqw) scale(${depth.toFixed(3)})`;
        el.style.zIndex = front ? 3 : 0;
        el.style.opacity = front ? 1 : 0.7;
        el.style.setProperty('--spin', `${(t * 40 * (i + 1)) % 360}deg`);
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
  }, [paused, rx]);

  return (
    <>
      {ROCKS.map((r, i) =>
        belt ? (
          <button
            key={i}
            type="button"
            className="orbiter orbiter--rock"
            ref={(el) => {
              refs.current[i] = el;
            }}
            aria-label="Asteroid: learn the word"
            onClick={() => onPick('asteroid')}
          >
            <svg viewBox="-9 -9 18 18" width={r.size} height={r.size} aria-hidden="true">
              <defs>
                <linearGradient id={`rock${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#b9b4ad" />
                  <stop offset="1" stopColor="#3a3a40" />
                </linearGradient>
              </defs>
              <polygon points={r.points} fill={`url(#rock${i})`} />
            </svg>
          </button>
        ) : null
      )}
      <button
        type="button"
        className="orbiter orbiter--craft"
        ref={(el) => {
          refs.current[ROCKS.length] = el;
        }}
        aria-label="Robot spacecraft: learn about it"
        onClick={() => onPick('craft')}
      >
        <svg viewBox="-14 -8 28 16" width="28" height="16" aria-hidden="true">
          <rect x="-13" y="-3" width="8" height="6" fill="#1b3f8f" stroke="#60a5fa" strokeWidth="0.6" />
          <rect x="5" y="-3" width="8" height="6" fill="#1b3f8f" stroke="#60a5fa" strokeWidth="0.6" />
          <rect x="-4" y="-4" width="8" height="8" rx="1" fill="#d9dde6" />
          <path d="M-3 -4 a3 2 0 0 1 6 0" fill="#ffffff" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="#9aa6bb" strokeWidth="0.6" />
        </svg>
      </button>
    </>
  );
}

export default function Planet({ body, label, active, mode, paused, now, overlay, picked, onPick, on3dError }) {
  const hostRef = useRef(null);
  const [view3d, setView3d] = useState('off'); // off | loading | ready
  const want3d = mode === '3d' && active;
  const url = textureUrl(body);
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;

  useEffect(() => {
    if (!want3d) {
      setView3d('off');
      return undefined;
    }
    let cancelled = false;
    let controller;
    setView3d('loading');
    import('../three/planetView.js')
      .then((m) => m.mountPlanet(hostRef.current, body, url, { overlay: overlayRef.current, isCancelled: () => cancelled }))
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
      const kind = e.clientX || e.clientY ? c.pick(e.clientX, e.clientY) : 'planet';
      if (kind === 'asteroid' || kind === 'craft' || kind === 'planet') onPick(kind);
      return;
    }
    onPick('planet');
  };

  const tiltDeg = Math.min(body.tilt, 0.5) * (180 / Math.PI);
  const classes = ['planet', `planet--${body.id}`];
  if (view3d === 'ready') classes.push('is-3d');
  if (body.deep) classes.push('planet--deep');
  if (overlay.atmosphere) classes.push('has-atmo');
  if (picked === 'planet' && view3d !== 'ready') classes.push('is-picked');
  const show2dExtras = active && view3d !== 'ready';

  return (
    <div className={`planet-wrap planet-wrap--${body.id}`} style={{ '--atmo': body.atmo || '#9fb4d8', '--orbit-w': body.rings ? '266%' : '177%' }}>
      {overlay.orbits && show2dExtras && <OrbitPath part="back" />}
      <button
        ref={hostRef}
        type="button"
        className={classes.join(' ')}
        style={{ '--tilt': `${tiltDeg.toFixed(1)}deg` }}
        aria-label={label}
        onClick={handleClick}
      >
        {body.rings && <Rings part="back" />}
        {body.deep ? (
          <DeepSpaceMap now={now} />
        ) : (
          <span className="globe">
            <span
              className="globe-surface"
              style={{ backgroundImage: url ? `url("${url}")` : 'none', backgroundColor: body.color }}
            />
          </span>
        )}
        {body.rings && <Rings part="front" />}
        {view3d === 'loading' && (
          <span className="planet-note" role="status">
            Loading 3D view
          </span>
        )}
      </button>
      {overlay.orbits && show2dExtras && <OrbitPath part="front" />}
      {show2dExtras && <Orbiters paused={paused} belt={overlay.belt} onPick={onPick} rx={body.rings ? 128 : 85} />}
      {overlay.labels && (
        <span className="planet-label" aria-hidden="true">
          {body.name}
        </span>
      )}
    </div>
  );
}
