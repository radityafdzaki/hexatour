import { useEffect, useMemo, useState } from 'react';
import { canSpeak, lookup, speak } from '../data/learn.js';
import { BODY_LEARN, ROBOT_SPEC, parseMarked, plainText } from '../data/lessons.js';
import { StatusTag } from './Status.jsx';
import { distanceNow } from '../data/robots.js';
import { SITES } from '../data/orbits.js';
import { dayText, sizeVsEarth, telemetryRows } from '../data/planetData.js';
import { SpeakerIcon } from './Icons.jsx';

// ---------- shared pieces ----------

export function ListenButton({ text, label = 'Audio Briefing' }) {
  const [on, setOn] = useState(false);
  if (!canSpeak) return null;
  const play = () => {
    if (on) {
      window.speechSynthesis.cancel();
      setOn(false);
      return;
    }
    speak(text, 0.85);
    setOn(true);
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        setOn(false);
        clearInterval(check);
      }
    }, 300);
  };
  return (
    <button type="button" className={on ? 'listen-btn is-on' : 'listen-btn'} onClick={play}>
      <SpeakerIcon />
      {on ? 'Stop' : label}
    </button>
  );
}

function Say({ text }) {
  if (!canSpeak) return null;
  return (
    <button type="button" className="say-btn" onClick={() => speak(text)} aria-label={`Hear "${text}"`} title="Hear it">
      <SpeakerIcon />
    </button>
  );
}

// Cadet: three big picture cards for the key words.
export function WordCards({ words }) {
  return (
    <div className="word-cards">
      {words.map((w) => {
        const g = lookup(w);
        if (!g) return null;
        return (
          <div key={w} className="word-card">
            <span className="word-card-icon" aria-hidden="true">
              {g.icon}
            </span>
            <span className="word-card-term">{w}</span>
            <span className="word-card-say">/{g.say}/</span>
            <span className="word-card-def">{g.kid}</span>
            <Say text={w} />
          </div>
        );
      })}
    </div>
  );
}

// Astronaut: a paragraph whose key words open their meaning.
export function MarkedText({ text }) {
  const [term, setTerm] = useState(null);
  useEffect(() => setTerm(null), [text]);
  const parts = parseMarked(text);
  const g = term && lookup(term);
  return (
    <div className="marked">
      <p className="marked-text">
        {parts.map((p, i) =>
          p.term ? (
            <button
              key={i}
              type="button"
              className={term === p.term ? 'term is-on' : 'term'}
              aria-expanded={term === p.term}
              onClick={() => setTerm(term === p.term ? null : p.term)}
            >
              {p.text}
            </button>
          ) : (
            <span key={i}>{p.text}</span>
          )
        )}
      </p>
      {g && (
        <div className="term-card" role="status">
          <div className="term-card-head">
            <span className="term-card-word">{term}</span>
            <span className="word-say">/{g.say}/</span>
            <Say text={term} />
          </div>
          <p>{g.def}</p>
          <p className="term-card-ex">
            <span>Example:</span> {g.ex}
          </p>
        </div>
      )}
    </div>
  );
}

export function QuickCheck({ quiz, title = 'Space Mission Quiz' }) {
  const [pick, setPick] = useState(null);
  useEffect(() => setPick(null), [quiz]);
  return (
    <section className="widget">
      <div className="widget-head">
        <h3>{title}</h3>
        <span className="learn-chip">1 question</span>
      </div>
      <p className="quiz-q">{quiz.q}</p>
      <div className="quiz-list">
        {quiz.options.map((o, i) => {
          let cls = 'quiz-choice';
          if (pick !== null && i === quiz.answer) cls += ' is-right';
          else if (pick === i) cls += ' is-wrong';
          return (
            <button key={o} type="button" className={cls} disabled={pick !== null} onClick={() => setPick(i)}>
              <span className="quiz-letter">{'ABC'[i]}</span>
              {o}
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <p className="quiz-result" role="status">
          <strong>{pick === quiz.answer ? 'Correct!' : 'Not quite.'}</strong> {quiz.why}{' '}
          <button type="button" className="link-btn" onClick={() => setPick(null)}>
            Try again
          </button>
        </p>
      )}
    </section>
  );
}

function seededShuffle(list, seed) {
  const out = [...list];
  let s = seed;
  for (let i = out.length - 1; i > 0; i -= 1) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Commander: fill the blanks of a mission summary with technical terms.
export function DecodeSummarize({ decode, seed = 7 }) {
  const chips = useMemo(() => seededShuffle([...decode.answers, ...decode.extra], seed), [decode, seed]);
  const [filled, setFilled] = useState([]);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setFilled([]);
    setChecked(false);
  }, [decode]);
  const pieces = decode.sentence.split('___');
  const done = filled.length === decode.answers.length;
  const score = filled.filter((f, i) => f === decode.answers[i]).length;

  return (
    <section className="widget">
      <div className="widget-head">
        <h3>Mission Debrief</h3>
        <span className="learn-chip">Fill {decode.answers.length} blanks</span>
      </div>
      <p className="fine">Tap the right science terms, in order, to complete the debrief.</p>
      <p className="decode-sentence">
        {pieces.map((piece, i) => (
          <span key={i}>
            {piece}
            {i < pieces.length - 1 && (
              <span
                className={`blank ${filled[i] ? 'is-filled' : ''} ${checked ? (filled[i] === decode.answers[i] ? 'is-right' : 'is-wrong') : ''}`}
              >
                {filled[i] || `(${i + 1})`}
              </span>
            )}
          </span>
        ))}
      </p>
      <div className="chips">
        {chips.map((c) => (
          <button key={c} type="button" className="chip" disabled={filled.includes(c) || done} onClick={() => setFilled((f) => (f.includes(c) || f.length >= decode.answers.length ? f : [...f, c]))}>
            {c}
          </button>
        ))}
      </div>
      <div className="widget-actions">
        <button type="button" className="btn btn--main" disabled={!done || checked} onClick={() => setChecked(true)}>
          Check summary
        </button>
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            setFilled([]);
            setChecked(false);
          }}
        >
          Reset
        </button>
      </div>
      {checked && (
        <p className="quiz-result" role="status">
          <strong>
            {score} of {decode.answers.length} correct.
          </strong>{' '}
          {score === decode.answers.length ? 'Debrief complete. Well done, Commander.' : `Answer: ${decode.answers.join(' · ')}.`}
        </p>
      )}
    </section>
  );
}

// Commander: put a robot's mission log back in time order.
export function OrderChallenge({ robot }) {
  const events = useMemo(() => {
    const list = robot.journey.slice(0, 4);
    return { right: list.map((e) => e[1]), shown: seededShuffle(list.map((e) => e[1]), robot.id.length * 13 + 3) };
  }, [robot]);
  const [order, setOrder] = useState([]);
  useEffect(() => setOrder([]), [robot.id]);
  const done = order.length === events.right.length;
  const score = order.filter((t, i) => t === events.right[i]).length;
  return (
    <section className="widget">
      <div className="widget-head">
        <h3>Mission Timeline</h3>
        <span className="learn-chip">Put 4 events in order</span>
      </div>
      <p className="fine">Tap the mission events from first to last.</p>
      <ol className="order-list">
        {events.shown.map((t) => {
          const at = order.indexOf(t);
          const state = done ? (events.right[at] === t ? 'is-right' : 'is-wrong') : '';
          return (
            <li key={t}>
              <button type="button" className={`order-item ${at >= 0 ? 'is-picked' : ''} ${state}`} disabled={at >= 0} onClick={() => setOrder((o) => (o.includes(t) ? o : [...o, t]))}>
                <span className="order-num">{at >= 0 ? at + 1 : ''}</span>
                {t}
              </button>
            </li>
          );
        })}
      </ol>
      {done && (
        <p className="quiz-result" role="status">
          <strong>
            {score} of {events.right.length} in the right place.
          </strong>{' '}
          <button type="button" className="link-btn" onClick={() => setOrder([])}>
            Try again
          </button>
        </p>
      )}
    </section>
  );
}

export function CompareTable({ robots, highlight, bare }) {
  const table = (
      <div className="table-wrap">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">Spacecraft</th>
              <th scope="col">Class</th>
              <th scope="col">Launch</th>
              <th scope="col">Primary objective</th>
              <th scope="col">Key instrument</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {robots.map((r) => (
              <tr key={r.id} className={r.id === highlight ? 'is-this' : ''}>
                <th scope="row">{r.short || r.name}</th>
                <td>{r.type}</td>
                <td>{r.launch.match(/\d{4}/)[0]}</td>
                <td className="wrap">{ROBOT_SPEC[r.id]?.goal}</td>
                <td className="wrap">{ROBOT_SPEC[r.id]?.instrument}</td>
                <td>
                  <StatusTag kind={r.status.state} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
  if (bare) return table;
  return (
    <section className="widget">
      <div className="widget-head">
        <h3>Mission Specs</h3>
        <span className="learn-chip">{robots.length} missions</span>
      </div>
      {table}
    </section>
  );
}

const fmt = (n, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

// Cadet: three picture cards. Size against Earth, length of a day, robots.
function FunFacts({ body, robots }) {
  if (body.deep) {
    const far = robots.reduce((a, r) => (r.horizons && (!a || r.horizons.rangeAu > a.horizons.rangeAu) ? r : a), null);
    const d = distanceNow(far.horizons, Date.now());
    return (
      <div className="fun-facts">
        <div className="fun-card">
          <DistanceArt au={d.au} />
          <p className="fun-big">{fmt(d.au)} × farther</p>
          <p>{far.name} is about {fmt(d.au)} times farther from the Sun than Earth is.</p>
        </div>
        <div className="fun-card">
          <ClockArt />
          <p className="fun-big">{fmt(d.lightHours, 0)} hours</p>
          <p>Its radio signal, moving at the speed of light, takes about that long to reach us.</p>
        </div>
        <div className="fun-card">
          <RobotsArt count={robots.length} />
          <p className="fun-big">{robots.length} robots</p>
          <p>NASA robots are on paths that leave the Solar System for good.</p>
        </div>
      </div>
    );
  }
  const ratio = sizeVsEarth(body.id);
  const sizeLine =
    ratio < 1
      ? `${body.name} is about ${fmt(ratio, 2)} times as wide as Earth.`
      : `${body.name} is about ${fmt(ratio, 1)} times wider than Earth.`;
  return (
    <div className="fun-facts">
      <div className="fun-card">
        <SizeArt ratio={ratio} color={body.color} />
        <p className="fun-big">{ratio < 1 ? `${fmt(ratio, 2)} × Earth` : `${fmt(ratio, 1)} × Earth`}</p>
        <p>{sizeLine}</p>
      </div>
      <div className="fun-card">
        <ClockArt />
        <p className="fun-big">1 day = {dayText(body.id)}</p>
        <p>From one sunrise to the next on {body.inText || body.name}. On Earth it takes 24 hours.</p>
      </div>
      <div className="fun-card">
        <RobotsArt count={robots.length} />
        <p className="fun-big">
          {robots.length} {robots.length === 1 ? 'robot' : 'robots'}
        </p>
        <p>NASA {robots.length === 1 ? 'robot has' : 'robots have'} visited {body.inText || body.name}.</p>
      </div>
    </div>
  );
}

// Two discs to scale: Earth on the left, the world on the right.
function SizeArt({ ratio, color }) {
  const big = Math.max(1, ratio);
  const earthR = 26 / big;
  const worldR = (26 * ratio) / big;
  return (
    <svg className="fun-art" viewBox="0 0 120 60" aria-hidden="true">
      <circle cx="30" cy="30" r={Math.max(earthR, 1.5)} fill="#2f6fd6" />
      <text x="30" y="58" textAnchor="middle">Earth</text>
      <circle cx="88" cy="30" r={Math.max(worldR, 1.5)} fill={color} />
    </svg>
  );
}

function ClockArt() {
  return (
    <svg className="fun-art" viewBox="0 0 120 60" aria-hidden="true">
      <circle cx="60" cy="30" r="22" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M60 30V15M60 30l11 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="square" />
      <circle cx="60" cy="30" r="2.5" fill="#2563eb" />
    </svg>
  );
}

function RobotsArt({ count }) {
  const n = Math.min(count, 9);
  const gap = 104 / Math.max(n, 1);
  return (
    <svg className="fun-art" viewBox="0 0 120 60" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const x = 8 + gap * i + gap / 2;
        return (
          <g key={i} transform={`translate(${x} 30)`}>
            <rect x="-9" y="-2.5" width="6" height="5" fill="#2563eb" />
            <rect x="3" y="-2.5" width="6" height="5" fill="#2563eb" />
            <rect x="-3" y="-3.5" width="6" height="7" fill="#d9b45f" />
          </g>
        );
      })}
    </svg>
  );
}

function DistanceArt({ au }) {
  // Sun, Earth at 1 au, the craft at its distance on a log scale.
  const x = (a) => 10 + 100 * (Math.log10(a + 1) / Math.log10(au + 1));
  return (
    <svg className="fun-art" viewBox="0 0 120 60" aria-hidden="true">
      <line x1="10" y1="30" x2="110" y2="30" stroke="#334155" strokeWidth="1" />
      <circle cx="10" cy="30" r="5" fill="#fff" />
      <circle cx={x(1)} cy="30" r="2.5" fill="#2f6fd6" />
      <text x={x(1)} y="46" textAnchor="middle">Earth</text>
      <rect x="104" y="27" width="6" height="6" fill="#d9b45f" />
    </svg>
  );
}

// Commander: the world's physical data and how its missions compare.
function TelemetryPanel({ body, robots }) {
  return (
    <section className="widget">
      <div className="widget-head">
        <h3>Planetary Telemetry &amp; Mission Specs</h3>
        <span className="learn-chip">Source: NASA fact sheets</span>
      </div>
      {body.deep ? (
        <div className="table-wrap">
          <table className="compare">
            <thead>
              <tr>
                <th scope="col">Spacecraft</th>
                <th scope="col">Distance from Sun</th>
                <th scope="col">Speed away from Sun</th>
                <th scope="col">One-way light time</th>
              </tr>
            </thead>
            <tbody>
              {robots
                .filter((r) => r.horizons)
                .map((r) => {
                  const d = distanceNow(r.horizons, Date.now());
                  return (
                    <tr key={r.id}>
                      <th scope="row">{r.name}</th>
                      <td>{fmt(d.au, 1)} au</td>
                      <td>{fmt(r.horizons.rateKmS, 1)} km/s</td>
                      <td>{fmt(d.lightHours, 1)} hours</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="compare telemetry-table">
            <thead>
              <tr>
                <th scope="col">Quantity</th>
                <th scope="col">{body.name}</th>
                <th scope="col">Compared</th>
              </tr>
            </thead>
            <tbody>
              {telemetryRows(body.id).map(([k, v, c]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                  <td>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <h4 className="widget-sub">Mission specs and instruments</h4>
      <CompareTable robots={robots} bare />
    </section>
  );
}

// The level panel for a world, shown below the slider (desktop) or in a sheet (phone).
export function Briefing({ body, level, robots, inspect, onInspect }) {
  const lesson = BODY_LEARN[body.id];
  if (level === 'cadet') {
    return (
      <div className="briefing briefing--cadet">
        <p className="briefing-story">{lesson.cadet.story}</p>
        <ListenButton text={`${body.name}. ${lesson.cadet.story}`} label="Audio Briefing" />
        <h3 className="briefing-sub">Fun Space Facts</h3>
        <FunFacts body={body} robots={robots} />
      </div>
    );
  }
  if (level === 'astronaut') {
    const hasPaths = !body.deep && robots.some((r) => !SITES[r.id]);
    return (
      <div className="briefing briefing--astronaut">
        <h3 className="briefing-sub">Planetary science</h3>
        <MarkedText text={lesson.astronaut.text} />
        <p className="fine">Tap an underlined term for its scientific meaning.</p>
        {hasPaths && (
          <div>
            <button type="button" className="btn btn--quiet inspect-btn" aria-pressed={Boolean(inspect)} onClick={onInspect}>
              <OrbitIcon /> {inspect ? 'Hide Orbit Paths' : 'Inspect Orbit Path'}
            </button>
            <p className="fine">Shows the path each orbiter and flyby takes around {body.inText || body.name}.</p>
          </div>
        )}
        <QuickCheck quiz={lesson.astronaut.quiz} title="Space Mission Quiz" />
      </div>
    );
  }
  return (
    <div className="briefing briefing--commander">
      <h3 className="briefing-sub">Astrophysics report: {body.name}</h3>
      <div className="report">
        {lesson.commander.report.map((p, i) => (
          <p key={i}>
            <span className="report-tag">{i === 0 ? '1. Physical state' : '2. Mission findings'}</span>
            {p}
          </p>
        ))}
      </div>
      <TelemetryPanel body={body} robots={robots} />
      <DecodeSummarize decode={lesson.commander.decode} seed={body.id.length * 31} />
    </div>
  );
}

function OrbitIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <ellipse cx="12" cy="12" rx="10" ry="4.5" strokeDasharray="2.5 2" />
      <circle cx="12" cy="12" r="3.2" />
      <rect x="19" y="9.5" width="3" height="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function briefingTitle(level) {
  return level === 'cadet' ? 'Space briefing' : level === 'astronaut' ? 'Mission briefing' : 'Commander report';
}

export { plainText };
