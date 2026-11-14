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
  return (
    <svg className={`rings rings--${part}`} viewBox="-120 -40 240 80" aria-hidden="true">
      <ellipse rx="112" ry="30" className="ring ring--a" />
      <ellipse rx="96" ry="25.5" className="ring ring--b" />
      <ellipse rx="78" ry="20.5" className="ring ring--c" />
    </svg>
  );
}

export default function Planet({ body, label, active, mode, paused, now, onOpen, on3dError }) {
  const hostRef = useRef(null);
  const [view3d, setView3d] = useState('off'); // off | loading | ready
  const want3d = mode === '3d' && active;
  const url = textureUrl(body);

  useEffect(() => {
    if (!want3d) {
      setView3d('off');
      return undefined;
    }
    let cancelled = false;
    let controller;
    setView3d('loading');
    import('../three/planetView.js')
      .then((m) => m.mountPlanet(hostRef.current, body, url))
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
    // `paused` is applied through its own effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [want3d, body.id]);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
    const c = hostRef.current && hostRef.current.__planet3d;
    if (c && view3d === 'ready') c.setPaused(paused);
  }, [paused, view3d]);

  const handleClick = () => {
    const host = hostRef.current;
    // A drag that rotated the 3D globe should not also open the robot list.
    if (host && host.dataset.dragged === '1') {
      host.dataset.dragged = '';
      return;
    }
    onOpen();
  };

  const tiltDeg = Math.min(body.tilt, 0.5) * (180 / Math.PI);
  const classes = ['planet', `planet--${body.id}`];
  if (view3d === 'ready') classes.push('is-3d');
  if (body.deep) classes.push('planet--deep');

  return (
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
  );
}
