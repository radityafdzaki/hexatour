import { useMemo } from 'react';
import { ROBOTS, distanceNow } from '../data/robots.js';
import { starPoints } from '../lib/drawn.js';

// Logarithmic so the planets and the far travellers fit in one circle.
const radius = (au) => 14 + 34 * Math.log10(au);

const CRAFT = [
  { id: 'voyager-1', tag: 'V1', angle: -58 },
  { id: 'voyager-2', tag: 'V2', angle: 138 },
  { id: 'pioneer-10', tag: 'P10', angle: 22 },
  { id: 'pioneer-11', tag: 'P11', angle: 205 },
  { id: 'new-horizons', tag: 'NH', angle: 92 },
];

export default function DeepSpaceMap({ now }) {
  const stars = useMemo(() => starPoints(110), []);
  const craft = CRAFT.map((c) => {
    const robot = ROBOTS.find((r) => r.id === c.id);
    const au = distanceNow(robot.horizons, now).au;
    const a = (c.angle * Math.PI) / 180;
    const r = radius(au);
    return { ...c, x: Math.cos(a) * r, y: Math.sin(a) * r, active: robot.status.state === 'active' };
  });

  return (
    <svg className="deep-map" viewBox="-100 -100 200 200" role="img" aria-labelledby="deep-map-title deep-map-desc">
      <title id="deep-map-title">Map of five spacecraft leaving the Solar System</title>
      <desc id="deep-map-desc">
        The Sun is at the center. Rings mark the orbit of Neptune and the edge of the Sun's bubble. Voyager 1 is
        farthest out, followed by Voyager 2, Pioneer 10, Pioneer 11 and New Horizons. Distances use a logarithmic
        scale and directions are not to scale.
      </desc>
      <g className="deep-bg">
        <circle r="99" className="deep-disc" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.s} opacity={s.o} className="deep-star" />
        ))}
      </g>
      <circle r={radius(30)} className="deep-ring" />
      <circle r={radius(120)} className="deep-ring deep-ring--edge" />
      <circle r="2.6" className="deep-sun" />
      {craft.map((c) => (
        <g key={c.id} className={c.active ? 'deep-craft is-active' : 'deep-craft'}>
          <line x1="0" y1="0" x2={c.x.toFixed(1)} y2={c.y.toFixed(1)} />
          <circle cx={c.x.toFixed(1)} cy={c.y.toFixed(1)} r="2.4" />
          <text x={(c.x * 0.8).toFixed(1)} y={(c.y * 0.8 + (c.y > 0 ? -5 : 9)).toFixed(1)} textAnchor="middle">
            {c.tag}
          </text>
        </g>
      ))}
    </svg>
  );
}
