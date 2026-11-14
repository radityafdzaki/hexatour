// The three learning ranks. Each rank changes how deep the astronomy goes:
// Cadet gets basic planet facts, an audio briefing and Fun Space Facts,
// Astronaut gets planetary science, a mission quiz and orbit paths,
// Commander gets astrophysics, telemetry tables and instrument specs.

export const LEVELS = [
  {
    id: 'cadet',
    rank: 'Level 1',
    name: 'Cadet',
    focus: 'Basic Space Exploration',
    text: 'Fun planet facts, size comparisons with Earth, and an audio briefing for every world.',
  },
  {
    id: 'astronaut',
    rank: 'Level 2',
    name: 'Astronaut',
    focus: 'Planetary Science & Missions',
    text: 'Craters, magnetic fields, elliptical orbits and mission goals, with a quiz and orbit paths.',
  },
  {
    id: 'commander',
    rank: 'Level 3',
    name: 'Commander',
    focus: 'Astrophysics & Telemetry Data',
    text: 'Core composition, spin-orbit resonance, gravity and instrument specs in telemetry tables.',
  },
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

import { GLOSSARY } from './glossary.js';

export { GLOSSARY };

export function lookup(word) {
  return GLOSSARY[word.toLowerCase()];
}

// Which glossary words appear in a block of text, in reading order.
// Longer terms are matched first so "magnetic field" wins over "field".
export function wordsIn(text, limit = 4) {
  const lower = text.toLowerCase();
  const found = [];
  Object.keys(GLOSSARY)
    .sort((a, b) => b.length - a.length)
    .forEach((w) => {
      if (found.some((f) => f.word.includes(w))) return;
      const m = new RegExp(`\\b${w}s?\\b`).exec(lower);
      if (m) found.push({ word: w, at: m.index });
    });
  return found
    .sort((a, b) => a.at - b.at)
    .slice(0, limit)
    .map((f) => f.word);
}

// Planet text for each rank. Astronaut uses the blurb in bodies.js.
export const BODY_TEXT = {
  mercury: {
    cadet: 'Mercury is the smallest planet and the closest to the Sun. It is super hot during the day and freezing cold at night!',
    commander: 'Mercury has an oversized iron core, about 85% of its radius, and a dipole field offset 480 km north. Its orbit precesses in the way general relativity predicts.',
  },
  venus: {
    cadet: 'Venus is wrapped in thick clouds. It is the hottest planet, even hotter than Mercury.',
    commander: 'A 92-bar CO₂ atmosphere drives a runaway greenhouse to about 465°C. Magellan’s radar showed a young, volcanic surface roughly 300 to 600 million years old.',
  },
  moon: {
    cadet: 'The Moon goes around Earth. Robots landed there before people did.',
    commander: 'Tidally locked, with a crust thicker on the far side. GRAIL gravity data put the crust at about 34 to 43 km, and permanently shadowed polar craters trap volatiles.',
  },
  mars: {
    cadet: 'Mars is the red planet. Robot cars called rovers drive on it and look for signs of old water.',
    commander: 'Surface pressure is under 1% of Earth’s. Rover data show long-lived lakes and rivers about 3.5 billion years ago, and Perseverance is caching samples for return.',
  },
  jupiter: {
    cadet: 'Jupiter is the biggest planet. It is made of gas, so there is no ground to stand on.',
    commander: 'Juno’s gravity science points to a dilute, fuzzy core. The magnetosphere is the largest structure in the Solar System, fed by volcanic Io.',
  },
  saturn: {
    cadet: 'Saturn has beautiful rings made of ice and rock. It is light enough to float in a giant bathtub.',
    commander: 'Ring particles are mostly water ice. Cassini’s Grand Finale measured ring mass, suggesting the rings may be only 10 to 100 million years old.',
  },
  uranus: {
    cadet: 'Uranus is an ice giant that spins on its side. It looks pale blue-green.',
    commander: 'An axial tilt of 97.8° gives 42-year polar days. Voyager 2 found a magnetic field tilted 59° from the spin axis and offset from the center.',
  },
  neptune: {
    cadet: 'Neptune is the farthest planet. It is cold, blue and very windy.',
    commander: 'Winds reach about 2,100 km/h, the fastest measured on any planet. Voyager 2 saw active nitrogen geysers on its captured moon Triton.',
  },
  deepspace: {
    cadet: 'Five spacecraft are flying so far away that they are leaving our Sun’s neighborhood.',
    commander: 'Voyager 1 crossed the heliopause at 121.6 au in 2012 and Voyager 2 at 119 au in 2018. The plasma-wave instruments confirmed the jump in density.',
  },
};

// Robot stories for Cadet (short and simple) and Commander (technical).
export const ROBOT_TEXT = {
  'mariner-10': {
    cadet: 'Mariner 10 was the first robot to visit Mercury. It flew past three times and took the first close photos.',
    commander: 'First gravity-assist trajectory (Venus, Feb 1974) into a 176-day solar orbit resonant with Mercury, enabling three encounters. Solar-pressure attitude trimming extended the mission.',
  },
  messenger: {
    cadet: 'MESSENGER was the first robot to go around Mercury. It found ice hiding in dark craters.',
    commander: 'Six gravity assists over 6.6 years, then a 12-hour eccentric polar orbit. Neutron spectrometry and radar-bright deposits confirmed polar water ice; it impacted at about 3.9 km/s.',
  },
  'mariner-2': {
    cadet: 'Mariner 2 was the first robot to visit another planet. It found that Venus is super hot.',
    commander: 'Microwave radiometry at 13.5 and 19 mm showed limb darkening, proving the heat came from the surface, not the ionosphere. It also gave the first in-situ solar wind data.',
  },
  'pioneer-venus': {
    cadet: 'Pioneer Venus sent an orbiter and four probes. The probes dived into the clouds of Venus.',
    commander: 'Four entry probes sampled the atmosphere at separated sites; the orbiter’s radar altimeter produced the first global topography and observed the ionosphere for 14 years.',
  },
  magellan: {
    cadet: 'Magellan used radar to see through the clouds of Venus. It made a map of almost the whole planet.',
    commander: 'Synthetic aperture radar mapped 98% of the surface at ~100 m resolution. Aerobraking circularized its orbit for gravity mapping before a planned atmospheric entry.',
  },
  'surveyor-1': {
    cadet: 'Surveyor 1 was the first American robot to land softly on the Moon. It showed the ground was safe for astronauts.',
    commander: 'Closed-loop radar-guided descent with a retro-rocket and vernier engines. Returned 11,240 images and strain-gauge data on soil bearing strength ahead of Apollo.',
  },
  lro: {
    cadet: 'LRO goes around the Moon and takes very sharp pictures. It even spotted the Apollo landing sites.',
    commander: 'LROC NAC resolves ~0.5 m; LOLA’s laser altimetry produced the reference lunar shape model. Diviner recorded some of the coldest measured temperatures in the Solar System.',
  },
  grail: {
    cadet: 'GRAIL was two twin robots named Ebb and Flow. They measured how strong the Moon pulls in each spot.',
    commander: 'Ka-band inter-satellite ranging measured micron-level distance changes to map lunar gravity to degree ~1,500, revealing crustal porosity and dikes.',
  },
  'viking-1': {
    cadet: 'Viking 1 was the first American robot to land on Mars and work there. It tested the soil for life.',
    commander: 'Lander biology experiments (GEX, LR, PR) gave ambiguous labeled-release results; GCMS found no organics at ppb levels. Operated over six years.',
  },
  sojourner: {
    cadet: 'Sojourner was the first rover on Mars. It was as small as a microwave oven.',
    commander: 'An 11.5 kg rover tethered to the Pathfinder lander via UHF relay. Its APXS showed andesitic rock compositions; airbag landing validated a low-cost entry architecture.',
  },
  spirit: {
    cadet: 'Spirit was a rover that drove for six years. It found signs of old hot springs on Mars.',
    commander: 'A seized right-front wheel scraped up opaline silica near Home Plate, evidence of hydrothermal activity. Became stuck in soft soil at Troy in 2009.',
  },
  opportunity: {
    cadet: 'Opportunity was a rover that kept going for almost 15 years. It found rocks that formed in water.',
    commander: 'Hematite concretions and jarosite at Meridiani indicated acidic groundwater. Drove 45.16 km before a planet-encircling dust storm in 2018 starved its solar arrays.',
  },
  phoenix: {
    cadet: 'Phoenix landed near the north pole of Mars. It dug up ice under the ground.',
    commander: 'Its robotic arm exposed sublimating water ice; the wet chemistry lab detected perchlorate, which reshaped the interpretation of Viking’s organic results.',
  },
  curiosity: {
    cadet: 'Curiosity is a big rover as heavy as a car. It is climbing a mountain on Mars.',
    commander: 'An MMRTG-powered rover delivered by sky crane. SAM detected organic molecules and seasonal methane variations; Gale Crater lake sediments show long-term habitability.',
  },
  insight: {
    cadet: 'InSight listened for marsquakes. It helped us learn what is deep inside Mars.',
    commander: 'SEIS recorded over 1,300 marsquakes, constraining a liquid core about 1,830 km in radius. Dust accumulation on its solar arrays ended operations in 2022.',
  },
  perseverance: {
    cadet: 'Perseverance is a rover that collects rock samples. One day they may be brought back to Earth.',
    commander: 'Terrain-relative navigation enabled a precise landing in Jezero. It seals cored samples in tubes; MOXIE produced oxygen from atmospheric CO₂.',
  },
  ingenuity: {
    cadet: 'Ingenuity was a small helicopter. It was the first machine to fly on another planet.',
    commander: 'A 1.8 kg coaxial rotorcraft spinning at about 2,500 rpm in air about 1% as dense as Earth’s. It made 72 flights before rotor damage ended it in 2024.',
  },
  galileo: {
    cadet: 'Galileo went around Jupiter for eight years. It found that a moon called Europa may hide an ocean.',
    commander: 'Despite a high-gain antenna failure, it returned data via the low-gain antenna with new compression. Magnetometer induction signatures pointed to a subsurface ocean at Europa.',
  },
  juno: {
    cadet: 'Juno flies around Jupiter over its poles. It takes pictures of swirling storms.',
    commander: 'A solar-powered spinner in a highly elliptical polar orbit. Microwave radiometry probes the deep atmosphere; gravity data indicate a dilute core.',
  },
  cassini: {
    cadet: 'Cassini went around Saturn for 13 years. It dropped a probe called Huygens onto the moon Titan.',
    commander: 'Its Grand Finale made 22 dives between the planet and rings. It found water-ice plumes at Enceladus and methane lakes on Titan before a planned entry in 2017.',
  },
  'voyager-1': {
    cadet: 'Voyager 1 is the farthest robot from Earth. It is now flying between the stars.',
    commander: 'An RTG-powered craft whose power drops about 4 W per year. It crossed the heliopause in August 2012; its signal now takes almost a full day to reach Earth.',
  },
  'voyager-2': {
    cadet: 'Voyager 2 is the only robot to visit Uranus and Neptune. Now it is in interstellar space too.',
    commander: 'The Grand Tour alignment allowed four encounters. Its working plasma science instrument directly measured the heliopause crossing in 2018.',
  },
  'pioneer-10': {
    cadet: 'Pioneer 10 was the first robot to fly past Jupiter. It carries a picture message for anyone who finds it.',
    commander: 'First to cross the asteroid belt and reach Jupiter. Its tracking data revealed the small “Pioneer anomaly”, later explained by thermal recoil.',
  },
  'pioneer-11': {
    cadet: 'Pioneer 11 was the first robot to visit Saturn. It showed later robots a safe path past the rings.',
    commander: 'A Jupiter gravity assist redirected it to Saturn in 1979, where it found the F ring. Contact ended in 1995 when its RTG power ran low.',
  },
  'new-horizons': {
    cadet: 'New Horizons flew past Pluto and then a strange space rock called Arrokoth.',
    commander: 'The fastest launch at the time (~16.3 km/s). Its 2019 flyby of Arrokoth imaged a contact binary formed by gentle merger in the Kuiper Belt.',
  },
};

// Spoken guide. Returns false when the browser cannot speak.
export function speak(text, rate = 0.92) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return false;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    const voice = synth.getVoices().find((v) => v.lang && v.lang.startsWith('en'));
    if (voice) u.voice = voice;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
