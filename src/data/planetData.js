// Physical data for each world, from the NASA Space Science Data Coordinated
// Archive planetary fact sheets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
//   diameter    equatorial diameter, km
//   mass        10^24 kg
//   gravity     surface (or 1-bar level) gravity, m/s^2
//   au          mean distance from the Sun, au
//   period      orbital period, Earth days (for the Moon: around Earth)
//   dayHours    length of one solar day (sunrise to sunrise), hours
// Earth for comparison: 12,756 km, 5.97, 9.8 m/s^2, 1 au, 365.2 days, 24 h.

export const EARTH = { diameter: 12756, mass: 5.97, gravity: 9.8 };

export const PLANET_DATA = {
  mercury: { diameter: 4879, mass: 0.33, gravity: 3.7, au: 0.387, period: 88.0, dayHours: 4222.6 },
  venus: { diameter: 12104, mass: 4.87, gravity: 8.9, au: 0.723, period: 224.7, dayHours: 2802.0 },
  moon: { diameter: 3475, mass: 0.073, gravity: 1.6, au: 1.0, period: 27.3, dayHours: 708.7, aroundEarth: true },
  mars: { diameter: 6792, mass: 0.642, gravity: 3.7, au: 1.52, period: 687.0, dayHours: 24.7 },
  jupiter: { diameter: 142984, mass: 1898, gravity: 23.1, au: 5.2, period: 4331, dayHours: 9.9 },
  saturn: { diameter: 120536, mass: 568, gravity: 9.0, au: 9.58, period: 10747, dayHours: 10.7 },
  uranus: { diameter: 51118, mass: 86.8, gravity: 8.7, au: 19.2, period: 30589, dayHours: 17.2 },
  neptune: { diameter: 49528, mass: 102, gravity: 11.0, au: 30.05, period: 59800, dayHours: 16.1 },
};

const num = (n, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

export function sizeVsEarth(id) {
  const p = PLANET_DATA[id];
  return p.diameter / EARTH.diameter;
}

export function dayText(id) {
  const h = PLANET_DATA[id].dayHours;
  if (h < 48) return `${num(h, 1)} hours`;
  const days = h / 24;
  return `${num(days, days < 100 ? 1 : 0)} Earth days`;
}

export function periodText(id) {
  const p = PLANET_DATA[id];
  if (p.period > 730) return `${num(p.period / 365.25, 1)} Earth years`;
  return `${num(p.period, 1)} Earth days`;
}

// Rows for the Commander telemetry table.
export function telemetryRows(id) {
  const p = PLANET_DATA[id];
  return [
    ['Equatorial diameter', `${num(p.diameter)} km`, `${num(p.diameter / EARTH.diameter, 2)} × Earth`],
    ['Mass', `${num(p.mass, p.mass < 1 ? 3 : 1)} × 10²⁴ kg`, `${num(p.mass / EARTH.mass, p.mass / EARTH.mass < 1 ? 3 : 1)} × Earth`],
    ['Surface gravity', `${num(p.gravity, 1)} m/s²`, `${num(p.gravity / EARTH.gravity, 2)} × Earth`],
    ['Mean distance from the Sun', `${num(p.au, p.au < 2 ? 3 : 2)} au`, `${num(p.au * 149.6, 1)} million km`],
    p.aroundEarth
      ? ['Orbital period (around Earth)', periodText(id), 'Earth’s orbit: 365.2 days']
      : ['Orbital period', periodText(id), `${num(p.period / 365.25, 2)} × Earth’s year`],
    ['Length of one solar day', dayText(id), `${num(p.dayHours, 1)} hours`],
  ];
}
