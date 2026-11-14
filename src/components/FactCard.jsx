import { useEffect, useRef } from 'react';
import { BODY_TEXT, ROBOT_TEXT, canSpeak, lookup, speak, wordsIn } from '../data/learn.js';
import { CloseIcon, SpeakerIcon } from './Icons.jsx';

const ASTEROID_FACT = {
  cadet: 'Some asteroids are as small as a car. Some are as big as a city!',
  astronaut: 'Most asteroids orbit between Mars and Jupiter, in the asteroid belt. They are leftovers from when the planets formed.',
  commander: 'The main belt holds well over a million bodies larger than 1 km, yet its total mass is only about 3% of the Moon’s.',
};

export function featuredRobot(robots) {
  return robots.find((r) => r.status.state === 'active') || robots[0];
}

function Say({ text, label }) {
  if (!canSpeak) return null;
  return (
    <button type="button" className="say-btn" onClick={() => speak(text)} aria-label={label || `Hear "${text}"`} title="Hear it">
      <SpeakerIcon />
    </button>
  );
}

export function WordLine({ word, level }) {
  const g = lookup(word);
  if (!g) return null;
  return (
    <div className="word">
      <div className="word-head">
        <span className="word-term">{word}</span>
        <span className="word-say">/{g.say}/</span>
        <Say text={word} />
      </div>
      <p className="word-def">{level === 'cadet' ? g.kid : g.def}</p>
    </div>
  );
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
  let word;
  let text;
  let action = null;

  if (kind === 'asteroid') {
    eyebrow = body.deep ? 'Icy rock in deep space' : 'Space rock';
    title = 'Asteroid';
    word = 'asteroid';
    text = ASTEROID_FACT[level];
  } else if (kind === 'craft') {
    const robot = featuredRobot(robots);
    eyebrow = `Robot explorer · ${robot.type}`;
    title = robot.name;
    word = wordsIn(robot.type, 1)[0] || 'spacecraft';
    text = level === 'astronaut' ? robot.science[0] : ROBOT_TEXT[robot.id]?.[level] || robot.science[0];
    action = (
      <button type="button" className="btn btn--main" onClick={() => onOpenRobot(robot.id)}>
        Read its story
      </button>
    );
  } else {
    const t = BODY_TEXT[body.id];
    eyebrow = body.kind;
    title = body.name;
    word = t.word;
    text = level === 'astronaut' ? body.blurb : t[level];
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
            <Say text={title} label={`Hear "${title}"`} />
          </h2>
        </div>
        <button type="button" className="icon-btn" aria-label="Close fact card" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
      <p className="fact-text">{text}</p>
      <WordLine word={word} level={level} />
      {action && <div className="fact-actions">{action}</div>}
    </aside>
  );
}
