import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BODIES, BODY_BY_ID } from './data/bodies.js';
import { ROBOTS, robotsFor } from './data/robots.js';
import { useMediaQuery, useNow, readStored, writeStored } from './lib/hooks.js';
import Planet from './components/Planet.jsx';
import RobotList from './components/RobotList.jsx';
import RobotDetail from './components/RobotDetail.jsx';
import Sheet from './components/Sheet.jsx';

const pad = (n) => String(n).padStart(2, '0');

function openLabel(body, count) {
  if (body.deep) return `See the ${count} robots in deep space`;
  const where = body.inText || body.name;
  if (count === 1) return `Meet the only robot to visit ${where}`;
  return `See the ${count} robots that visited ${where}`;
}

function Chevron({ dir }) {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
      <path d={dir === 'prev' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'} fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function App() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [mode, setMode] = useState(() => (readStored('view-mode', '2d') === '3d' ? '3d' : '2d'));
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [active, setActive] = useState(0);
  const [selectedBody, setSelectedBody] = useState(null);
  const [robotId, setRobotId] = useState(null);
  const [notice, setNotice] = useState('');

  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const listHeadingRef = useRef(null);
  const activeRef = useRef(0);
  const minuteNow = useNow(!paused, 60000);

  const counts = useMemo(() => Object.fromEntries(BODIES.map((b) => [b.id, robotsFor(b.id).length])), []);
  const selected = selectedBody ? BODY_BY_ID[selectedBody] : null;
  const selectedRobots = useMemo(() => (selectedBody ? robotsFor(selectedBody) : []), [selectedBody]);
  const robot = robotId ? ROBOTS.find((r) => r.id === robotId) : null;

  const chooseMode = (next) => {
    setMode(next);
    writeStored('view-mode', next);
    setNotice('');
  };

  const on3dError = useCallback(() => {
    setMode('2d');
    writeStored('view-mode', '2d');
    setNotice('The 3D view could not start on this device, so the planets are shown in 2D.');
  }, []);

  // Which slide sits nearest the middle of the viewport (x on desktop, y on phones).
  const measureActive = useCallback(() => {
    const desktop = window.matchMedia('(min-width: 768px)').matches;
    const mid = desktop ? window.innerWidth / 2 : window.innerHeight / 2;
    let best = 0;
    let bestDist = Infinity;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const center = desktop ? r.left + r.width / 2 : r.top + r.height / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    if (best !== activeRef.current) {
      activeRef.current = best;
      setActive(best);
    }
  }, []);

  useEffect(() => {
    // At most one measurement per frame. The timer is a fallback for when the
    // browser holds back animation frames (a background tab, battery saver).
    let frame = 0;
    let timer = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      frame = 0;
      timer = 0;
      measureActive();
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(run);
      timer = setTimeout(run, 150);
    };
    const track = trackRef.current;
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [measureActive]);

  const goTo = useCallback(
    (index, instant) => {
      const i = Math.max(0, Math.min(BODIES.length - 1, index));
      const el = slideRefs.current[i];
      if (!el) return;
      const behavior = instant || reducedMotion ? 'auto' : 'smooth';
      if (window.matchMedia('(min-width: 768px)').matches) {
        const track = trackRef.current;
        const left = el.offsetLeft - (track.clientWidth - el.offsetWidth) / 2;
        track.scrollTo({ left, behavior });
      } else {
        // Phones jump straight there: a smooth scripted scroll fights the
        // page's mandatory scroll snapping and can stall. Swiping stays smooth.
        window.scrollTo({ top: el.offsetTop, behavior: 'auto' });
      }
      // Do not rely on scroll events alone to notice where we landed.
      setTimeout(measureActive, 80);
      setTimeout(measureActive, 700);
    },
    [reducedMotion, measureActive]
  );

  // Keep the same world in view when the layout flips between phone and desktop.
  useEffect(() => {
    goTo(activeRef.current, true);
  }, [isDesktop, goTo]);

  // Sliding to another world on desktop closes the robot list of the previous one.
  useEffect(() => {
    if (isDesktop && selectedBody && BODIES[active].id !== selectedBody && !robotId) setSelectedBody(null);
  }, [active, isDesktop, selectedBody, robotId]);

  useEffect(() => {
    const onKey = (e) => {
      if (!isDesktop || document.querySelector('dialog[open]')) return;
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(activeRef.current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(activeRef.current - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDesktop, goTo]);

  // Mouse drag on the desktop track. Touch and trackpads scroll it natively.
  const drag = useRef(null);
  const onTrackPointerDown = (e) => {
    if (!isDesktop || e.pointerType !== 'mouse' || e.button !== 0) return;
    if (e.target.closest('.planet.is-3d')) return;
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft, moved: false };
  };
  const onTrackPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      trackRef.current.classList.add('is-dragging');
    }
    if (d.moved) trackRef.current.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    trackRef.current.classList.remove('is-dragging');
    measureActive();
    goTo(activeRef.current);
    // Swallow the click that follows a drag so it does not open a robot list.
    const swallow = (ev) => {
      ev.stopPropagation();
      ev.preventDefault();
    };
    window.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
  };

  const openBody = (index) => {
    const body = BODIES[index];
    if (index !== activeRef.current) goTo(index);
    setSelectedBody(body.id);
    if (isDesktop) {
      requestAnimationFrame(() => {
        const h = listHeadingRef.current;
        if (!h) return;
        h.focus({ preventScroll: true });
        h.closest('.robots-inline').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }
  };

  const listSheetOpen = !isDesktop && Boolean(selected) && !robot;

  return (
    <div className={paused ? 'app is-paused' : 'app'}>
      <header className="site-header">
        <div className="brand">
          <h1>HEXATOUR</h1>
          <p>The interactive planetary exploration encyclopedia</p>
        </div>
        <div className="controls">
          <div className="seg" role="group" aria-label="Planet view">
            <button type="button" aria-pressed={mode === '2d'} onClick={() => chooseMode('2d')}>
              2D
            </button>
            <button type="button" aria-pressed={mode === '3d'} onClick={() => chooseMode('3d')}>
              3D
            </button>
          </div>
          <button type="button" className="btn btn--quiet" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
            {paused ? 'Play' : 'Pause'}
            <span className="wide-only"> motion</span>
          </button>
        </div>
      </header>

      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}

      <main>
        <section className="stage" aria-label="Worlds visited by NASA robots">
          <button
            type="button"
            className="nav-btn nav-btn--prev"
            aria-label="Previous world"
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
          >
            <Chevron dir="prev" />
          </button>
          <button
            type="button"
            className="nav-btn nav-btn--next"
            aria-label="Next world"
            disabled={active === BODIES.length - 1}
            onClick={() => goTo(active + 1)}
          >
            <Chevron dir="next" />
          </button>

          <div
            className="track"
            ref={trackRef}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
          >
            {BODIES.map((body, i) => {
              const isActive = i === active;
              const label = openLabel(body, counts[body.id]);
              return (
                <article
                  key={body.id}
                  className={isActive ? 'slide is-active' : 'slide'}
                  ref={(el) => {
                    slideRefs.current[i] = el;
                  }}
                  aria-label={`${body.name}, ${i + 1} of ${BODIES.length}`}
                >
                  <Planet
                    body={body}
                    label={label}
                    active={isActive}
                    mode={mode}
                    paused={paused}
                    now={minuteNow}
                    onOpen={() => openBody(i)}
                    on3dError={on3dError}
                  />
                  <div className="slide-copy">
                    <p className="slide-index">
                      {pad(i + 1)} / {pad(BODIES.length)} · {body.kind}
                    </p>
                    <h2>{body.name}</h2>
                    <p className="slide-order">{body.order}</p>
                    <p className="slide-blurb">{body.blurb}</p>
                    {body.deep && (
                      <p className="slide-key">
                        Inner ring: the orbit of Neptune. Dashed ring: the edge of the Sun's bubble, about 120 au out.
                        Spacing is logarithmic.
                      </p>
                    )}
                    <button type="button" className="btn btn--main" onClick={() => openBody(i)}>
                      {label}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <nav className="rail" aria-label="Jump to a world">
            <ol>
              {BODIES.map((body, i) => (
                <li key={body.id}>
                  <button
                    type="button"
                    className={i === active ? 'rail-stop is-active' : 'rail-stop'}
                    aria-current={i === active ? 'true' : undefined}
                    aria-label={`Go to ${body.name}`}
                    onClick={() => goTo(i)}
                  >
                    <span className="rail-dot" aria-hidden="true" />
                    <span className="rail-name">{body.name}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        {isDesktop && (
          <section className="robots-inline" aria-live="polite">
            {selected ? (
              <RobotList
                body={selected}
                robots={selectedRobots}
                headingId="robots-heading"
                headingRef={listHeadingRef}
                onPick={setRobotId}
              />
            ) : (
              <p className="hint">Pick a world above to see which robots went there.</p>
            )}
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>
          Mission facts and photos come from <a href="https://science.nasa.gov/" target="_blank" rel="noreferrer">NASA Science</a> and
          the <a href="https://images.nasa.gov/" target="_blank" rel="noreferrer">NASA Image and Video Library</a>. Planet maps come
          from <a href="https://github.com/nasa/NASA-3D-Resources" target="_blank" rel="noreferrer">NASA 3D Resources</a> and{' '}
          <a href="https://trek.nasa.gov/" target="_blank" rel="noreferrer">NASA Solar System Treks</a>. Spacecraft distances come
          from <a href="https://ssd.jpl.nasa.gov/horizons/" target="_blank" rel="noreferrer">NASA/JPL Horizons</a>.
        </p>
        <p>Made for the 2026 NASA Space Apps Challenge. This site is not endorsed by NASA.</p>
      </footer>

      <Sheet open={listSheetOpen} onClose={() => setSelectedBody(null)} variant="list" labelledBy="robots-sheet-heading">
        {selected && (
          <>
            <div className="sheet-bar">
              <button type="button" className="btn btn--quiet" onClick={() => setSelectedBody(null)}>
                Close
              </button>
            </div>
            <RobotList body={selected} robots={selectedRobots} headingId="robots-sheet-heading" onPick={setRobotId} />
          </>
        )}
      </Sheet>

      <Sheet open={Boolean(robot)} onClose={() => setRobotId(null)} variant="detail" labelledBy="robot-title">
        {robot && (
          <RobotDetail
            robot={robot}
            bodyId={selectedBody}
            titleId="robot-title"
            closeLabel={isDesktop ? 'Close' : 'Back to list'}
            onClose={() => setRobotId(null)}
            paused={paused}
          />
        )}
      </Sheet>
    </div>
  );
}
