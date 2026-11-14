import { useState } from 'react';
import { StatusTags, StatusLegend } from './Status.jsx';
import { ChevronRight, CloseIcon } from './Icons.jsx';

function Thumb({ photo }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="thumb thumb--empty" aria-hidden="true" />;
  return (
    <img
      className="thumb"
      src={photo.thumb}
      alt=""
      width="64"
      height="64"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function RobotList({ body, robots, headingId, onPick, headingRef, onClose }) {
  const where = body.inText || body.name;
  return (
    <div className="robots">
      <div className="robots-title">
        <h2 id={headingId} ref={headingRef} tabIndex={-1}>
          {body.deep ? 'Robots in deep space' : `Robots that visited ${where}`}
        </h2>
        {onClose && (
          <button type="button" className="close-btn" onClick={onClose}>
            <CloseIcon />
            <span>Close</span>
          </button>
        )}
      </div>
      <div className="robots-head">
        <p className="robots-count">
          {robots.length === 1 ? '1 robot. Pick it to read its story.' : `${robots.length} robots. Pick one to read its story.`}
        </p>
        <StatusLegend />
      </div>

      {robots.length === 0 ? (
        <p className="empty">No robot missions are listed for {where} yet.</p>
      ) : (
        <ul className="robot-list">
          {robots.map((r) => (
            <li key={r.id}>
              <button type="button" className="robot-row" onClick={() => onPick(r.id)}>
                <Thumb photo={r.photo} />
                <span className="robot-row-text">
                  <span className="robot-name">{r.name}</span>
                  <span className="robot-meta">
                    {r.type} · launched {r.launch.match(/\d{4}/)[0]}
                  </span>
                  {r.visits && r.visits[body.id] && <span className="robot-visit">{r.visits[body.id]}</span>}
                  <StatusTags status={r.status} />
                </span>
                <ChevronRight className="row-chevron" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
