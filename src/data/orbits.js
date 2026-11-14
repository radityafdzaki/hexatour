// Where each robot appears around its world in the space view.
//   orbit:   circles the world (orbiters)
//   flyby:   passes the world once and leaves (flybys)
//   surface: a beacon at its landing site, turning with the planet
// Landing sites are planetocentric latitude and east longitude in degrees,
// from the NASA mission pages.

export const SITES = {
  'surveyor-1': [-2.47, -43.34],
  'viking-1': [22.27, -47.95],
  sojourner: [19.13, -33.22],
  spirit: [-14.57, 175.47],
  opportunity: [-1.95, -5.53],
  phoenix: [68.22, -125.75],
  curiosity: [-4.59, 137.44],
  insight: [4.5, 135.62],
  perseverance: [18.44, 77.45],
  ingenuity: [18.6, 77.2],
};

export function placement(robot, bodyId) {
  if (SITES[robot.id] && bodyId !== 'deepspace') return 'surface';
  const t = robot.type.toLowerCase();
  if (bodyId === 'deepspace') return 'outbound';
  if (t.includes('orbiter')) return robot.bodies[0] === bodyId ? 'orbit' : 'flyby';
  return 'flyby';
}

// Short names that fit beside a small model.
export function shortName(robot) {
  return robot.short || robot.name.replace(/ \(.*\)$/, '');
}
