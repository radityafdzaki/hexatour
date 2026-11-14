import { useEffect, useState } from 'react';
import { StatusTags } from './Status.jsx';
import { distanceNow } from '../data/robots.js';
import { BODY_BY_ID } from '../data/bodies.js';
import { useNow } from '../lib/hooks.js';

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

export default function RobotDetail({ robot, bodyId, titleId, closeLabel, onClose, paused }) {
  const visit = robot.visits && robot.visits[bodyId];
  const body = BODY_BY_ID[bodyId];

  return (
    <article className="detail">
      <header className="detail-head">
        <div>
          <p className="detail-type">{robot.type}</p>
          <h2 id={titleId}>{robot.name}</h2>
        </div>
        <button type="button" className="btn btn--quiet" onClick={onClose}>
          {closeLabel}
        </button>
      </header>

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
          <dt>Launched</dt>
          <dd>{robot.launch}</dd>
        </div>
        <div>
          <dt>{robot.arrivalLabel}</dt>
          <dd>{robot.arrival}</dd>
        </div>
      </dl>

      {robot.horizons && <Distance horizons={robot.horizons} paused={paused} />}

      <section>
        <h3>How the machine works</h3>
        <ul className="plain">
          {robot.how.map((t) => (
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
          {robot.science.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

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
