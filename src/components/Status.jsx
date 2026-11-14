// Status is never shown by color alone: each state has its own shape and label.

const GLYPHS = {
  active: (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" />
    </svg>
  ),
  ended: (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <rect x="2" y="2" width="8" height="8" />
    </svg>
  ),
  left: (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 0.8c2.3 0 4 1.7 4 3.9C10 7.6 6 11.4 6 11.4S2 7.6 2 4.7c0-2.2 1.7-3.9 4-3.9z" />
    </svg>
  ),
};

const LABELS = { active: 'Active', ended: 'Ended', left: 'Left on site' };

export const STATUS_HELP = [
  ['active', 'The mission is still running.'],
  ['ended', 'It stopped working, or contact was lost.'],
  ['left', 'The robot, or part of it, is still at the place it explored.'],
];

export function StatusTag({ kind }) {
  return (
    <span className={`tag tag--${kind}`}>
      {GLYPHS[kind]}
      {LABELS[kind]}
    </span>
  );
}

export function StatusTags({ status }) {
  return (
    <span className="tags">
      <StatusTag kind={status.state} />
      {status.leftOnSite && <StatusTag kind="left" />}
    </span>
  );
}

export function StatusLegend() {
  return (
    <dl className="legend" aria-label="What the status labels mean">
      {STATUS_HELP.map(([kind, text]) => (
        <div key={kind} className="legend-item">
          <dt>
            <StatusTag kind={kind} />
          </dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  );
}
