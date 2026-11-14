import { useEffect, useRef } from 'react';
import { BODY_TEXT, ROBOT_TEXT } from '../data/learn.js';
import { distanceNow } from '../data/robots.js';
import { EARTH, PLANET_DATA, dayText } from '../data/planetData.js';
import { CloseIcon } from './Icons.jsx';

const ASTEROID_FACT = {
  cadet: 'Some asteroids are as small as a car. Some are as big as a city!',
  astronaut: 'Most asteroids orbit between Mars and Jupiter, in the asteroid belt. They are leftovers from when the planets formed.',
  commander: 'The main belt holds well over a million bodies larger than 1 km, yet its total mass is only about 3% of the Moon’s.',
};

const fmt = (n, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

export function featuredRobot(robots) {
  return robots.find((r) => r.status.state === 'active') || robots[0];
}

// Quick numbers shown on each card: science facts, not vocabulary.
function planetStats(body, robots) {
  if (body.deep) {
    const far = robots.filter((r) => r.horizons).sort((a, b) => b.horizons.rangeAu - a.horizons.rangeAu)[0];
    const d = distanceNow(far.horizons, Date.now());
    return [
      ['Farthest robot', far.name],
      ['Its distance from the Sun', `${fmt(d.au, 1)} au`],
      ['Radio signal travel time', `${fmt(d.lightHours, 1)} hours`],
    ];
  }
  const p = PLANET_DATA[body.id];
  return [
    ['Gravity', `${fmt(p.gravity, 1)} m/s², ${fmt(p.gravity / EARTH.gravity, 2)} × Earth`],
    ['One day lasts', dayText(body.id)],
    p.aroundEarth ? ['Distance from Earth', '384,400 km'] : ['Distance from the Sun', `${fmt(p.au, 2)} au`],
  ];
}

export default function FactCard({ fact, level, robots, onClose, onSeeRobots, onOpenRobot }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fact, onClose]);

  const { kind, body } = fact;
  let eyebrow;
  let title;
  let text;
  let stats;
  let action = null;

  if (kind === 'asteroid') {
    eyebrow = body.deep ? 'Icy rock in deep space' : 'Space rock';
    title = 'Asteroid';
    text = ASTEROID_FACT[level];
    stats = [
      ['Main belt', '2.2 to 3.2 au from the Sun'],
      ['Largest object', 'Ceres, about 940 km wide'],
      ['Made of', 'Rock, metal and some ice'],
    ];
  } else if (kind === 'robot' || kind === 'craft') {
    const robot = robots.find((r) => r.id === fact.id) || featuredRobot(robots);
    eyebrow = `Robot explorer · ${robot.type}`;
    title = robot.name;
    text = level === 'astronaut' ? robot.science[0] : ROBOT_TEXT[robot.id]?.[level] || robot.science[0];
    stats = [
      ['Launched', robot.launch],
      ['Status', robot.status.state === 'active' ? 'Active' : robot.status.leftOnSite ? 'Ended, still on site' : 'Ended'],
      ['Where', robot.location],
    ];
    action = (
      <button type="button" className="btn btn--main" onClick={() => onOpenRobot(robot.id)}>
        Read its story
      </button>
    );
  } else {
    eyebrow = body.kind;
    title = body.name;
    text = level === 'astronaut' ? body.blurb : BODY_TEXT[body.id][level];
    stats = planetStats(body, robots);
    action = (
      <button type="button" className="btn btn--main" onClick={onSeeRobots}>
        {robots.length === 1 ? 'Meet its robot' : `See its ${robots.length} robots`}
      </button>
    );
  }

  return (
    <aside className="fact" role="dialog" aria-labelledby="fact-title" tabIndex={-1} ref={ref}>
      <div className="fact-head">
        <div>
          <p className="fact-eyebrow">{eyebrow}</p>
          <h2 id="fact-title" className="fact-title">
            {title}
          </h2>
        </div>
        <button type="button" className="icon-btn" aria-label="Close fact card" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <p className="fact-text">{text}</p>
      <dl className="fact-stats">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {action && <div className="fact-actions">{action}</div>}
    </aside>
  );
}
