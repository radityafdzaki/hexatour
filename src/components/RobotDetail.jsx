import { useEffect, useMemo, useState } from 'react';
import { StatusTags } from './Status.jsx';
import { distanceNow } from '../data/robots.js';
import { BODY_BY_ID } from '../data/bodies.js';
import { useNow } from '../lib/hooks.js';
import { ROBOT_TEXT, lookup, wordsIn } from '../data/learn.js';
import { ROBOT_SPEC } from '../data/lessons.js';
import { CompareTable, ListenButton, MarkedText, OrderChallenge, QuickCheck, WordCards } from './Lessons.jsx';
import { ArrowLeft, CloseIcon } from './Icons.jsx';

function Photo({ photo }) {
  const [state, setState] = useState('loading'); // loading | ready | error
  useEffect(() => setState('loading'), [photo.src]);

  return (
    <figure className="photo">
      <div className={`photo-frame photo-frame--${state}`}>
        {state !== 'error' && (
          <img
            src={photo.src}
            alt={photo.caption}
            width="960"
            height="640"
            onLoad={() => setState('ready')}
            onError={() => setState('error')}
          />
        )}
        {state === 'loading' && <span className="photo-msg">Loading photo from NASA</span>}
        {state === 'error' && <span className="photo-msg">The photo could not be loaded. Use the link below to see it at NASA.</span>}
      </div>
      <figcaption>
        {photo.caption} Image: NASA.{' '}
        <a href={photo.page} target="_blank" rel="noreferrer">
          Open "{photo.title}" in the NASA Image Library
        </a>
      </figcaption>
    </figure>
  );
}

const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function parseDay(text) {
  const m = /(\d{1,2}) (\w{3}) (\d{4})/.exec(text || '');
  if (!m || !(m[2] in MONTHS)) return null;
  return Date.UTC(+m[3], MONTHS[m[2]], +m[1]);
}

function lastYear(journey) {
  for (let i = journey.length - 1; i >= 0; i -= 1) {
    const d = parseDay(journey[i][0]);
    if (d) return d;
    const y = /(\d{4})(?!.*\d{4})/.exec(journey[i][0]);
    if (y) return Date.UTC(+y[1], 6, 1);
  }
  return null;
}

function Distance({ horizons, paused }) {
  const now = useNow(!paused, 1000);
  const d = distanceNow(horizons, now);
  const hours = Math.floor(d.lightHours);
  const minutes = Math.floor((d.lightHours - hours) * 60);
  return (
    <section className="distance" aria-label="Distance from the Sun">
      <h3>Distance from the Sun right now</h3>
      <p className="distance-big">
        {d.au.toFixed(2)} <span>au</span>
      </p>
      <dl className="distance-more">
        <div>
          <dt>Kilometers</dt>
          <dd>{whole.format(d.km)}</dd>
        </div>
        <div>
          <dt>Time for light to cross it</dt>
          <dd>
            {hours} h {minutes} min
          </dd>
        </div>
      </dl>
      <p className="fine">
        Estimated from NASA/JPL Horizons position data for 14 November 2026. One au is the average distance between
        Earth and the Sun. The distance from Earth differs by up to 1 au.
      </p>
    </section>
  );
}

// Cadet: the story read aloud, and three picture cards for the key words.
function StoryTime({ robot }) {
  const story = ROBOT_TEXT[robot.id]?.cadet;
  const words = wordsIn(`${robot.type} ${story} ${robot.how.join(' ')}`, 3);
  return (
    <section className="learn-box">
      <h3>Story time</h3>
      <p className="story">{story}</p>
      <ListenButton text={`${robot.name}. ${story}`} />
      <h3 className="learn-sub">Space Word Cards</h3>
      <WordCards words={words} />
    </section>
  );
}

const TYPES = ['Flyby', 'Orbiter', 'Lander', 'Rover', 'Helicopter'];

// Astronaut: one quick question built from this robot's own facts.
function robotQuiz(robot) {
  const own = TYPES.find((t) => robot.type.toLowerCase().includes(t.toLowerCase())) || 'Orbiter';
  const others = TYPES.filter((t) => t !== own);
  const a = others[robot.id.length % others.length];
  const b = others[(robot.id.length + 2) % others.length];
  const rot = robot.id.charCodeAt(0) % 3;
  const opts = [own, a, b];
  const options = [...opts.slice(rot), ...opts.slice(0, rot)];
  const g = lookup(own.toLowerCase());
  return {
    q: `What kind of mission is ${robot.name}?`,
    options,
    answer: options.indexOf(own),
    why: `${robot.name} is ${own === 'Orbiter' ? 'an' : 'a'} ${own.toLowerCase()}: ${g ? g.def.charAt(0).toLowerCase() + g.def.slice(1) : ''}`,
  };
}

// Mark the first glossary words in a sentence so they can be tapped.
function autoMark(text) {
  let out = text;
  wordsIn(text, 3).forEach((w) => {
    out = out.replace(new RegExp(`\\b(${w}s?)\\b`, 'i'), (m) => `[[${m}|${w}]]`);
  });
  return out;
}

// Commander: telemetry numbers for this robot.
function Telemetry({ robot, paused }) {
  const now = useNow(!paused, 1000);
  const launch = parseDay(robot.launch);
  const end = robot.status.state === 'active' ? now : lastYear(robot.journey);
  const years = launch && end ? (end - launch) / (365.25 * 864e5) : null;
  const days = launch ? Math.floor((now - launch) / 864e5) : null;
  const spec = ROBOT_SPEC[robot.id] || {};
  return (
    <section className="learn-box">
      <div className="learn-box-head">
        <h3>Technical brief</h3>
        <span className="learn-chip">Commander</span>
      </div>
      <p className="story story--tech">{ROBOT_TEXT[robot.id]?.commander}</p>
      <dl className="telemetry">
        <div>
          <dt>Primary objective</dt>
          <dd className="small">{spec.goal}</dd>
        </div>
        <div>
          <dt>Key instrument</dt>
          <dd className="small">{spec.instrument}</dd>
        </div>
        <div>
          <dt>Days since launch</dt>
          <dd>{days ? whole.format(days) : '—'}</dd>
        </div>
        <div>
          <dt>{robot.status.state === 'active' ? 'Operating for' : 'Operated for'}</dt>
          <dd>{years ? `${years.toFixed(1)} years` : '—'}</dd>
        </div>
      </dl>
    </section>
  );
}

export default function RobotDetail({ robot, bodyId, titleId, isDesktop, onClose, paused, level, peers }) {
  const visit = robot.visits && robot.visits[bodyId];
  const body = BODY_BY_ID[bodyId];
  const cadet = level === 'cadet';
  const how = cadet ? robot.how.slice(0, 2) : robot.how;
  const science = cadet ? robot.science.slice(0, 2) : robot.science;
  const quizFor = useMemo(() => robotQuiz(robot), [robot]);

  return (
    <article className="detail">
      <header className="detail-head">
        <button type="button" className="back-btn" onClick={onClose}>
          {isDesktop ? <CloseIcon /> : <ArrowLeft />}
          <span>{isDesktop ? 'Close' : 'Back to list'}</span>
        </button>
        <p className="detail-type">{robot.type}</p>
        <h2 id={titleId}>{robot.name}</h2>
      </header>

      {cadet && <StoryTime robot={robot} />}

      <Photo photo={robot.photo} />

      <section className="status-block" aria-label="Status">
        <StatusTags status={robot.status} />
        <p>{robot.status.note}</p>
      </section>

      <dl className="facts">
        <div>
          <dt>Location</dt>
          <dd>{robot.location}</dd>
        </div>
        {visit && body && (
          <div>
            <dt>{body.deep ? 'In deep space' : `At ${body.inText || body.name}`}</dt>
            <dd>{visit}</dd>
          </div>
        )}
        <div>
          <dt>Mission name</dt>
          <dd>{robot.mission}</dd>
        </div>
        <div>
          <dt>Mission type</dt>
          <dd>{robot.type}</dd>
        </div>
        <div>
          <dt>Launched</dt>
          <dd>{robot.launch}</dd>
        </div>
        <div>
          <dt>{robot.arrivalLabel}</dt>
          <dd>{robot.arrival}</dd>
        </div>
      </dl>

      {level === 'commander' && <Telemetry robot={robot} paused={paused} />}

      {robot.horizons && <Distance horizons={robot.horizons} paused={paused} />}

      <section>
        <h3>{cadet ? 'How it works' : 'How the machine works'}</h3>
        <ul className="plain">
          {how.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Its journey</h3>
        <ol className="journey">
          {robot.journey.map(([date, text]) => (
            <li key={date + text}>
              <span className="journey-date">{date}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3>What it taught us</h3>
        <ul className="plain">
          {science.map((t) => (
            <li key={t}>{level === 'astronaut' ? <MarkedText text={autoMark(t)} /> : t}</li>
          ))}
        </ul>
      </section>

      {level === 'astronaut' && <QuickCheck quiz={quizFor} />}
      {level === 'commander' && peers.length > 0 && <CompareTable robots={peers} highlight={robot.id} />}
      {level === 'commander' && <OrderChallenge robot={robot} />}

      <section>
        <h3>People behind it</h3>
        <ul className="people">
          {robot.people.map(([name, role]) => (
            <li key={name}>
              <span className="person">{name}</span>
              <span className="role">{role}</span>
            </li>
          ))}
        </ul>
        <p className="fine">A few of the public mission leaders. Thousands of people worked on each mission.</p>
      </section>

      <section>
        <h3>Sources</h3>
        <ul className="sources">
          {robot.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.label}: {robot.short || robot.name}
              </a>
            </li>
          ))}
          <li>
            <a href={robot.photo.page} target="_blank" rel="noreferrer">
              NASA Image and Video Library: photo record
            </a>
          </li>
          {robot.horizons && (
            <li>
              <a href="https://ssd.jpl.nasa.gov/horizons/" target="_blank" rel="noreferrer">
                NASA/JPL Horizons: position data
              </a>
            </li>
          )}
        </ul>
      </section>

    </article>
  );
}
