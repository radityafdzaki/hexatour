import { useEffect, useMemo, useState } from 'react';
import { canSpeak, lookup, speak } from '../data/learn.js';
import { BODY_LEARN, ROBOT_SPEC, parseMarked, plainText } from '../data/lessons.js';
import { StatusTag } from './Status.jsx';
import { SpeakerIcon } from './Icons.jsx';

// ---------- shared pieces ----------

export function ListenButton({ text, label = 'Listen to Story' }) {
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

export function QuickCheck({ quiz, title = 'Quick Mission Check' }) {
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
        <h3>Decode &amp; Summarize</h3>
        <span className="learn-chip">Fill {decode.answers.length} blanks</span>
      </div>
      <p className="fine">Tap the technical terms in order to complete the mission summary.</p>
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
          {score === decode.answers.length ? 'Report decoded. Well done, Commander.' : `Answer: ${decode.answers.join(' · ')}.`}
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
        <h3>Decode &amp; Summarize</h3>
        <span className="learn-chip">Rebuild the log</span>
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

export function CompareTable({ robots, highlight }) {
  return (
    <section className="widget">
      <div className="widget-head">
        <h3>Telemetry &amp; Technical Comparison</h3>
        <span className="learn-chip">{robots.length} missions</span>
      </div>
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
    </section>
  );
}

// The level panel for a world, shown below the slider (desktop) or in a sheet (phone).
export function Briefing({ body, level, robots }) {
  const lesson = BODY_LEARN[body.id];
  if (level === 'cadet') {
    return (
      <div className="briefing briefing--cadet">
        <p className="briefing-story">{lesson.cadet.story}</p>
        <ListenButton text={`${body.name}. ${lesson.cadet.story}`} />
        <h3 className="briefing-sub">Space Word Cards</h3>
        <WordCards words={lesson.cadet.words} />
      </div>
    );
  }
  if (level === 'astronaut') {
    return (
      <div className="briefing briefing--astronaut">
        <h3 className="briefing-sub">Science log</h3>
        <MarkedText text={lesson.astronaut.text} />
        <p className="fine">Tap an underlined word to see its meaning and an example.</p>
        <QuickCheck quiz={lesson.astronaut.quiz} />
      </div>
    );
  }
  return (
    <div className="briefing briefing--commander">
      <h3 className="briefing-sub">Technical report: {body.name}</h3>
      <div className="report">
        {lesson.commander.report.map((p, i) => (
          <p key={i}>
            <span className="report-tag">{i === 0 ? '1. Physical state' : '2. Mission findings'}</span>
            {p}
          </p>
        ))}
      </div>
      <CompareTable robots={robots} />
      <DecodeSummarize decode={lesson.commander.decode} seed={body.id.length * 31} />
    </div>
  );
}

export function briefingTitle(level) {
  return level === 'cadet' ? 'Story time' : level === 'astronaut' ? 'Mission briefing' : 'Commander report';
}

export { plainText };
