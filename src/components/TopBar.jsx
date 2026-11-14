import { useEffect, useRef, useState } from 'react';
import { LEVELS, LEVEL_BY_ID } from '../data/learn.js';
import {
  BookIcon,
  BugIcon,
  CaretIcon,
  CheckIcon,
  DotsIcon,
  EyeIcon,
  GuideIcon,
  PauseIcon,
  PlayIcon,
  RankIcon,
} from './Icons.jsx';

export const OVERLAY_ITEMS = [
  ['orbits', 'Orbit lines', 'Paths that moons, rocks and robots follow'],
  ['belt', 'Asteroid belt', 'Rocky objects drifting through space'],
  ['labels', 'Planet labels', 'Name tags beside each world'],
  ['atmosphere', 'Atmosphere glow', 'The thin halo of air at the edge'],
];

const BUG_URL = 'https://github.com/radityafdzaki/hexatour/issues/new';

// A button with a floating panel. Closes on Escape or a press outside.
function Dropdown({ id, open, setOpen, button, children, align = 'start', panelClass = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        ref.current?.querySelector('[aria-expanded]')?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setOpen]);

  return (
    <div className="dd" ref={ref}>
      {button}
      {open && (
        <div id={id} className={`dd-panel dd-panel--${align} ${panelClass}`}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function TopBar({ mode, onMode, paused, onPause, level, onLevel, overlay, onOverlay, onGuide }) {
  const [menu, setMenu] = useState(null); // overlay | learn | more | null
  const setter = (name) => (v) => setMenu(v ? name : null);
  const current = LEVEL_BY_ID[level];

  return (
    <header className="topbar">
      <h1 className="logo">HEXATOUR</h1>

      <div className="topbar-left">
        <Dropdown
          id="overlay-menu"
          open={menu === 'overlay'}
          setOpen={setter('overlay')}
          button={
            <button
              type="button"
              className="nav-pill"
              aria-expanded={menu === 'overlay'}
              aria-controls="overlay-menu"
              onClick={() => setMenu(menu === 'overlay' ? null : 'overlay')}
            >
              <EyeIcon />
              <span className="pill-text">Visual Overlay</span>
            </button>
          }
        >
          <p className="dd-title">Visual Overlay</p>
          <ul className="switches">
            {OVERLAY_ITEMS.map(([key, label, help]) => (
              <li key={key}>
                <label className="switch">
                  <input type="checkbox" checked={overlay[key]} onChange={(e) => onOverlay({ ...overlay, [key]: e.target.checked })} />
                  <span className="switch-track" aria-hidden="true" />
                  <span className="switch-text">
                    <span>{label}</span>
                    <small>{help}</small>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Dropdown>

        <Dropdown
          id="learn-menu"
          open={menu === 'learn'}
          setOpen={setter('learn')}
          panelClass="dd-panel--learn"
          button={
            <button
              type="button"
              className="nav-pill"
              aria-expanded={menu === 'learn'}
              aria-controls="learn-menu"
              aria-label={`Learn level: ${current.name}`}
              onClick={() => setMenu(menu === 'learn' ? null : 'learn')}
            >
              <BookIcon className="wide-icon" />
              <RankIcon level={level} className="narrow-icon" />
              <span className="pill-text">
                Learn: <strong>{current.name}</strong>
              </span>
              <CaretIcon />
            </button>
          }
        >
          <p className="dd-title">Choose your space rank</p>
          <ul className="ranks" role="radiogroup" aria-label="Learning rank">
            {LEVELS.map((l) => {
              const on = l.id === level;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={on ? 'rank is-on' : 'rank'}
                    onClick={() => {
                      onLevel(l.id);
                      setMenu(null);
                    }}
                  >
                    <span className="rank-badge">
                      <RankIcon level={l.id} width={24} height={24} />
                    </span>
                    <span className="rank-text">
                      <span className="rank-level">
                        {l.rank} · {l.focus}
                      </span>
                      <span className="rank-name">{l.name}</span>
                      <span className="rank-desc">{l.text}</span>
                    </span>
                    <span className="rank-check">{on && <CheckIcon />}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Dropdown>
      </div>

      <div className="topbar-right">
        <div className="seg" role="group" aria-label="Planet view">
          <button type="button" aria-pressed={mode === '2d'} onClick={() => onMode('2d')}>
            2D
          </button>
          <button type="button" aria-pressed={mode === '3d'} onClick={() => onMode('3d')}>
            3D
          </button>
        </div>
        <button
          type="button"
          className="icon-btn"
          aria-pressed={paused}
          aria-label={paused ? 'Play motion' : 'Pause motion'}
          title={paused ? 'Play motion' : 'Pause motion'}
          onClick={onPause}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
        <Dropdown
          id="more-menu"
          open={menu === 'more'}
          setOpen={setter('more')}
          align="end"
          button={
            <button
              type="button"
              className="icon-btn icon-btn--dots"
              aria-label="More"
              aria-expanded={menu === 'more'}
              aria-controls="more-menu"
              onClick={() => setMenu(menu === 'more' ? null : 'more')}
            >
              <DotsIcon />
            </button>
          }
        >
          <ul className="menu-list">
            <li>
              <button
                type="button"
                onClick={() => {
                  setMenu(null);
                  onGuide();
                }}
              >
                <GuideIcon /> User Guide
              </button>
            </li>
            <li>
              <a href={BUG_URL} target="_blank" rel="noreferrer" onClick={() => setMenu(null)}>
                <BugIcon /> Report a Bug
              </a>
            </li>
          </ul>
        </Dropdown>
      </div>
    </header>
  );
}
