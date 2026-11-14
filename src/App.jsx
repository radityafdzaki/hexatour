import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BODIES, BODY_BY_ID } from './data/bodies.js';
import { ROBOTS, robotsFor } from './data/robots.js';
import { useMediaQuery, useNow, readStored, writeStored } from './lib/hooks.js';
import Planet from './components/Planet.jsx';
import RobotList from './components/RobotList.jsx';
import RobotDetail from './components/RobotDetail.jsx';
import Sheet from './components/Sheet.jsx';
import TopBar from './components/TopBar.jsx';
import Starfield from './components/Starfield.jsx';
import FactCard from './components/FactCard.jsx';
import Guide from './components/Guide.jsx';
import { Briefing, ListenButton, briefingTitle } from './components/Lessons.jsx';
import { BODY_LEARN } from './data/lessons.js';
import { BODY_TEXT, LEVEL_BY_ID } from './data/learn.js';

const OVERLAY_DEFAULT = { orbits: true, belt: true, labels: true, atmosphere: true };

function readOverlay() {
  try {
    return { ...OVERLAY_DEFAULT, ...JSON.parse(readStored('overlay', '{}')) };
  } catch {
    return OVERLAY_DEFAULT;
  }
}

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
  const [level, setLevel] = useState(() => {
    const v = readStored('learn-level', 'cadet');
    return LEVEL_BY_ID[v] ? v : 'cadet';
  });
  const [overlay, setOverlay] = useState(readOverlay);
  const [fact, setFact] = useState(null); // { kind, index }
  const [guideOpen, setGuideOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  // Astronaut "Inspect Orbit Path": highlights the paths of the robots
  // around the world in view.
  const [inspect, setInspect] = useState(false);

  const chooseLevel = (next) => {
    setLevel(next);
    writeStored('learn-level', next);
    if (next !== 'astronaut') setInspect(false);
  };
  const toggleInspect = () => {
    setInspect((v) => !v);
    // On a phone the briefing is a sheet over the planet: close it so the
    // paths can be seen.
    setBriefOpen(false);
  };
  const chooseOverlay = (next) => {
    setOverlay(next);
    writeStored('overlay', JSON.stringify(next));
  };

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
        const start = track.scrollLeft;
        track.scrollTo({ left, behavior });
        // Some browsers drop a smooth scroll on a snapping container. If it
        // has not started moving shortly after, jump there instead.
        if (behavior === 'smooth' && Math.abs(left - start) > 2) {
          setTimeout(() => {
            if (Math.abs(track.scrollLeft - start) < 1) track.scrollTo({ left, behavior: 'auto' });
          }, 250);
        }
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

  useEffect(() => {
    setFact((f) => (f && f.index !== active ? null : f));
    setInspect(false);
  }, [active]);

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

  const pickInSpace = (index, kind, id) => {
    if (index !== activeRef.current) goTo(index);
    setFact({ kind, index, id });
  };
  const factBody = fact ? BODIES[fact.index] : null;
  const factRobots = useMemo(() => (factBody ? robotsFor(factBody.id) : []), [factBody]);
  const peers = useMemo(() => (selectedBody ? robotsFor(selectedBody) : []), [selectedBody]);

  const listSheetOpen = !isDesktop && Boolean(selected) && !robot;

  return (
    <div className={paused ? 'app is-paused' : 'app'}>
      <Starfield paused={paused} belt={overlay.belt} dense={['mars', 'jupiter'].includes(BODIES[active].id)} />
      <TopBar
        mode={mode}
        onMode={chooseMode}
        paused={paused}
        onPause={() => setPaused((p) => !p)}
        level={level}
        onLevel={chooseLevel}
        overlay={overlay}
        onOverlay={chooseOverlay}
        onGuide={() => setGuideOpen(true)}
      />

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
                    overlay={overlay}
                    picked={fact && fact.index === i ? fact.kind : null}
                    inspect={inspect && level === 'astronaut' && isActive}
                    onPick={(kind, id) => pickInSpace(i, kind, id)}
                    on3dError={on3dError}
                  />
                  <div className="slide-copy">
                    <p className="slide-index">
                      {pad(i + 1)} / {pad(BODIES.length)} · {body.kind}
                    </p>
                    <h2>{body.name}</h2>
                    <p className="slide-order">{body.order}</p>
                    <p className={`slide-blurb slide-blurb--${level}`}>
                      {level === 'cadet' ? BODY_LEARN[body.id].cadet.story : level === 'astronaut' ? body.blurb : BODY_TEXT[body.id].commander}
                    </p>
                    {level === 'cadet' && isActive && <ListenButton text={`${body.name}. ${BODY_LEARN[body.id].cadet.story}`} />}
                    {body.deep && (
                      <p className="slide-key">
                        Inner ring: the orbit of Neptune. Dashed ring: the edge of the Sun's bubble, about 120 au out.
                        Spacing is logarithmic.
                      </p>
                    )}
                    <div className="slide-actions">
                      <button type="button" className="btn btn--main" onClick={() => openBody(i)}>
                        {label}
                      </button>
                      {!isDesktop && (
                        <button type="button" className="btn btn--quiet" onClick={() => setBriefOpen(true)}>
                          {level === 'cadet' ? 'Fun Space Facts' : level === 'astronaut' ? 'Planetary science & quiz' : 'Telemetry & mission specs'}
                        </button>
                      )}
                    </div>
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
          <section className="briefing-inline" aria-labelledby="briefing-heading">
            <div className="briefing-title">
              <h2 id="briefing-heading">
                {briefingTitle(level)}: {BODIES[active].name}
              </h2>            </div>
            <Briefing
              body={BODIES[active]}
              level={level}
              robots={robotsFor(BODIES[active].id)}
              inspect={inspect}
              onInspect={toggleInspect}
            />
          </section>
        )}

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

      {fact && factBody && (
        <FactCard
          fact={{ kind: fact.kind, body: factBody, id: fact.id }}
          level={level}
          robots={factRobots}
          onClose={() => setFact(null)}
          onSeeRobots={() => {
            setFact(null);
            openBody(fact.index);
          }}
          onOpenRobot={(id) => {
            setFact(null);
            setSelectedBody(factBody.id);
            setRobotId(id);
          }}
        />
      )}

      <Sheet open={listSheetOpen} onClose={() => setSelectedBody(null)} variant="list" labelledBy="robots-sheet-heading">
        {selected && (
          <>
            <RobotList
              body={selected}
              robots={selectedRobots}
              headingId="robots-sheet-heading"
              onPick={setRobotId}
              onClose={() => setSelectedBody(null)}
            />
          </>
        )}
      </Sheet>

      <Sheet open={Boolean(robot)} onClose={() => setRobotId(null)} variant="detail" labelledBy="robot-title">
        {robot && (
          <RobotDetail
            robot={robot}
            bodyId={selectedBody}
            titleId="robot-title"
            isDesktop={isDesktop}
            level={level}
            peers={peers}
            onClose={() => setRobotId(null)}
            paused={paused}
          />
        )}
      </Sheet>

      <Sheet open={!isDesktop && briefOpen} onClose={() => setBriefOpen(false)} variant="list" labelledBy="briefing-sheet-heading">
        <div className="robots">
          <div className="robots-title">
            <h2 id="briefing-sheet-heading">
              {briefingTitle(level)}: {BODIES[active].name}
            </h2>
            <button type="button" className="close-btn" onClick={() => setBriefOpen(false)}>
              Close
            </button>
          </div>
          <Briefing
            body={BODIES[active]}
            level={level}
            robots={robotsFor(BODIES[active].id)}
            inspect={inspect}
            onInspect={toggleInspect}
          />
        </div>
      </Sheet>

      <Sheet open={guideOpen} onClose={() => setGuideOpen(false)} variant="detail" labelledBy="guide-title">
        <Guide onClose={() => setGuideOpen(false)} />
      </Sheet>
    </div>
  );
}
