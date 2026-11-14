// What each world teaches at each rank, from basic facts to astrophysics.
//   cadet:     a very short space briefing (read aloud by Audio Briefing).
//   astronaut: one planetary-science paragraph; [[term]] or [[shown text|term]]
//              marks a science term that opens a short explanation. One quiz.
//   commander: a two-part astrophysics report.

export const BODY_LEARN = {
  mercury: {
    cadet: {
      story: 'Mercury is the smallest planet and the closest to the Sun. It is super hot during the day and freezing cold at night!',
    },
    astronaut: {
      text: 'Mercury travels around the Sun on a stretched, [[elliptical orbit]] once every 88 Earth days. It has almost no [[atmosphere]] to hold in heat, so it faces [[extreme temperatures]]: about 430°C by day and −180°C at night. Its gray surface is covered in [[craters|crater]] from ancient impacts. Mariner 10 made the first [[flyby]], and MESSENGER became the first [[orbiter]] to map the whole planet.',
      quiz: {
        q: 'Why does Mercury get so cold at night?',
        options: ['It has almost no atmosphere to trap heat', 'It is the planet farthest from the Sun', 'Its surface is covered in ice'],
        answer: 0,
        why: 'With almost no atmosphere, heat escapes into space as soon as the Sun sets.',
      },
    },
    commander: {
      report: [
        'Mercury is the second densest planet after Earth: its iron-rich core extends to roughly 85% of the planetary radius, leaving a comparatively thin silicate mantle and crust. The planet is locked in a 3:2 spin-orbit resonance, rotating three times for every two orbits, so a single solar day lasts about 176 Earth days. This slow rotation, combined with an eccentric orbit (e ≈ 0.21), produces some of the largest surface temperature swings in the Solar System.',
        'MESSENGER’s gamma-ray, neutron and X-ray spectrometers revealed unexpectedly high abundances of volatile elements such as sulfur and potassium, challenging models in which Mercury formed under intense heat. Neutron spectrometry and Earth-based radar together identified hydrogen-rich deposits, interpreted as water ice, inside permanently shadowed polar craters. Magnetometer data showed an internal dipole field offset about 480 km north of the planet’s center.',
      ],
    },
  },
  venus: {
    cadet: {
      story: 'Venus is wrapped in thick, yellow clouds. It is the hottest planet, even hotter than Mercury!',
    },
    astronaut: {
      text: 'Venus is almost the same size as Earth, but its thick [[atmosphere]] is mostly carbon dioxide. This gas traps heat in a runaway [[greenhouse effect]], making the surface hot enough to melt lead, about 465°C. Clouds of sulfuric acid hide the ground, so NASA’s Magellan [[orbiter]] used [[radar]] to map it. The maps showed huge [[volcanoes|volcano]] and wide lava plains.',
      quiz: {
        q: 'How did Magellan see the surface of Venus through its clouds?',
        options: ['With radar', 'With a telescope on Earth', 'By landing a rover'],
        answer: 0,
        why: 'Radar waves pass through the clouds and bounce back from the ground.',
      },
    },
    commander: {
      report: [
        'Venus’s surface pressure is about 92 bar, comparable to the pressure 900 m under the sea, and its carbon dioxide atmosphere sustains a runaway greenhouse that holds the surface near 465°C with little contrast between day and night. The planet rotates retrograde once every 243 Earth days, longer than its 225-day year, while the upper atmosphere super-rotates around the planet in about four days.',
        'Magellan’s synthetic aperture radar mapped about 98% of the surface. The relatively low and uniform density of impact craters suggests a surface only a few hundred million years old, consistent with widespread volcanic resurfacing. Pioneer Venus entry probes measured atmospheric structure at four separate sites, and its orbiter’s radar altimeter produced the first global topographic map.',
      ],
    },
  },
  moon: {
    cadet: {
      story: 'The Moon goes around Earth. Robots landed there before astronauts did!',
    },
    astronaut: {
      text: 'The Moon is Earth’s only natural satellite, and it keeps the same face toward us as it [[orbits|orbit]]. With no [[atmosphere]], old [[craters|crater]] stay sharp for billions of years. In 1966 the Surveyor 1 [[lander]] showed the ground was firm enough for astronauts. Today the Lunar Reconnaissance Orbiter still maps the surface, and the GRAIL twins measured its [[gravity]].',
      quiz: {
        q: 'What did Surveyor 1 show before the Apollo landings?',
        options: ['The ground was firm enough to land on', 'The Moon has liquid water', 'The Moon has a thick atmosphere'],
        answer: 0,
        why: 'Surveyor 1 touched down softly and its footpads did not sink deep into the soil.',
      },
    },
    commander: {
      report: [
        'The Moon is tidally locked, its rotation synchronized with its 27.3-day orbit, so the near side always faces Earth. Its crust is thicker on the far side, and the near-side maria are basaltic lava plains that filled large impact basins roughly 3 to 3.9 billion years ago. The leading formation model is a giant impact between the proto-Earth and a Mars-sized body.',
        'GRAIL’s twin spacecraft measured minute changes in their separation to map the lunar gravity field in high detail, indicating a highly fractured, porous crust with an average thickness of about 34 to 43 km. LRO’s Diviner radiometer recorded temperatures below −240°C inside permanently shadowed polar craters, cold traps where water ice can persist, and its cameras have imaged the Apollo landing sites.',
      ],
    },
  },
  mars: {
    cadet: {
      story: 'Mars is the red planet. Robot cars called rovers drive on it and look for clues about old water!',
    },
    astronaut: {
      text: 'Mars is a cold desert world with a thin [[atmosphere]] of carbon dioxide. Its red color comes from iron-rich dust, and huge [[dust storms|dust storm]] can cover the whole planet. NASA [[rovers|rover]] such as Curiosity and Perseverance have found rocks that formed in lakes and rivers long ago. The [[helicopter]] Ingenuity even made the first powered flight on another planet.',
      quiz: {
        q: 'What made the rover Opportunity stop working in 2018?',
        options: ['A planet-wide dust storm covered its solar panels', 'It ran out of wheels', 'It fell into a deep crater'],
        answer: 0,
        why: 'Dust blocked sunlight from its solar panels, so it could no longer make power.',
      },
    },
    commander: {
      report: [
        'Mars has a mean surface pressure of about 6 millibar, less than 1% of Earth’s, so liquid water is unstable at the surface today. Yet orbital and rover evidence, including layered lake sediments in Gale Crater, a preserved river delta in Jezero Crater, and hydrated minerals such as jarosite and clays, records a wetter climate roughly 3.5 to 4 billion years ago.',
        'Curiosity’s Sample Analysis at Mars suite has detected complex organic molecules and seasonal variation in atmospheric methane. InSight’s seismometer recorded more than 1,300 marsquakes, constraining a liquid, iron-rich core about 1,830 km in radius. Perseverance is coring and sealing rock samples for possible return to Earth, and its MOXIE experiment produced oxygen from atmospheric carbon dioxide.',
      ],
    },
  },
  jupiter: {
    cadet: {
      story: 'Jupiter is the biggest planet. It is made of gas, so there is no ground to stand on!',
    },
    astronaut: {
      text: 'Jupiter is a [[gas giant]] more than 11 times wider than Earth. Its stripes are bands of clouds, and the Great Red Spot is a [[storm]] bigger than our whole planet. Jupiter has a powerful [[magnetic field]] and dozens of [[moons|moon]]. Galileo was the first [[orbiter]] to circle it, and Juno now flies over its poles.',
      quiz: {
        q: 'What is the Great Red Spot?',
        options: ['A giant storm', 'A volcano', 'A frozen ocean'],
        answer: 0,
        why: 'It is a huge, long-lived storm in Jupiter’s clouds.',
      },
    },
    commander: {
      report: [
        'Jupiter contains more than twice the mass of all the other planets combined. Beneath its ammonia cloud decks, hydrogen is compressed into a metallic, electrically conducting fluid whose motion generates the strongest planetary magnetic field in the Solar System. The resulting magnetosphere traps intense radiation belts and is fed with sulfur and oxygen ions from volcanic Io.',
        'Juno’s gravity measurements indicate a dilute core whose heavy elements are mixed far into the envelope, rather than a compact rocky center. Its microwave radiometer probes the atmosphere hundreds of kilometers below the visible clouds. Earlier, Galileo’s entry probe sampled the atmosphere directly, and its magnetometer detected induced fields at Europa consistent with a salty subsurface ocean.',
      ],
    },
  },
  saturn: {
    cadet: {
      story: 'Saturn has beautiful rings made of ice and rock. It is so light it could float in a giant bathtub!',
    },
    astronaut: {
      text: 'Saturn is a [[gas giant]] famous for its bright [[rings]], made of countless pieces of [[ice]] and rock. The rings are wide but very thin, often only about 10 meters thick. Saturn has more than 140 known [[moons|moon]], including Titan with its thick atmosphere. The Cassini [[orbiter]] studied the planet for 13 years.',
      quiz: {
        q: 'What are Saturn’s rings mostly made of?',
        options: ['Pieces of water ice', 'Hot gas', 'Solid metal sheets'],
        answer: 0,
        why: 'Most ring particles are water ice, from tiny grains to large boulders.',
      },
    },
    commander: {
      report: [
        'Saturn’s mean density, about 0.69 g/cm³, is lower than that of water. Its main rings span roughly 280,000 km yet are typically only about 10 m thick, and they consist overwhelmingly of water ice. Gaps such as the Cassini Division are sculpted by orbital resonances with moons; the inner edge of the Cassini Division lies at the 2:1 resonance with Mimas.',
        'During its Grand Finale, Cassini made 22 orbits between the planet and its rings, measuring the ring mass through gravity science; the low mass supports a geologically young age for the rings. The mission discovered water-rich plumes venting from Enceladus’s south pole, and the Huygens probe descended through Titan’s atmosphere onto a surface shaped by liquid methane and ethane.',
      ],
    },
  },
  uranus: {
    cadet: {
      story: 'Uranus is an ice giant that rolls around the Sun on its side. It looks pale blue-green!',
    },
    astronaut: {
      text: 'Uranus is an [[ice giant]], made mostly of water, ammonia and methane around a small rocky core. Its axis is tipped over by about 98 degrees, so it rolls along its [[orbit]] on its side. That tilt gives each pole about 42 years of sunlight and then 42 years of darkness. Uranus also has 13 faint, dark [[rings]], which Voyager 2 photographed during its 1986 [[flyby]].',
      quiz: {
        q: 'Why does Uranus have such long seasons?',
        options: ['Its axis is tipped on its side', 'It spins very fast', 'It has no moons'],
        answer: 0,
        why: 'Because Uranus lies on its side, each pole points at the Sun for decades.',
      },
    },
    commander: {
      report: [
        'Uranus has an obliquity of 97.8°, most likely the result of one or more giant impacts early in its history. Methane in its upper atmosphere absorbs red light, giving the planet its cyan color, and its internal heat flux is remarkably low compared with the other giant planets.',
        'Voyager 2, the only spacecraft to visit, found a magnetic field tilted about 59° from the rotation axis and offset from the planet’s center, implying generation in a shell of electrically conducting fluid rather than a deep core. It also discovered ten new moons and two new rings, and characterized the narrow, dark ring system first detected from Earth in 1977.',
      ],
    },
  },
  neptune: {
    cadet: {
      story: 'Neptune is the farthest planet from the Sun. It is cold, blue and super windy!',
    },
    astronaut: {
      text: 'Neptune is an [[ice giant]] about 30 times farther from the Sun than Earth, so one trip around its [[orbit]] takes 165 years. Methane in its [[atmosphere]] makes it look deep blue. It has the fastest winds measured in the Solar System and dark [[storms|storm]] that come and go. In 1989 Voyager 2 made the only [[flyby]] and found geysers on the moon Triton.',
      quiz: {
        q: 'Which spacecraft is the only one to have visited Neptune?',
        options: ['Voyager 2', 'Cassini', 'Juno'],
        answer: 0,
        why: 'Voyager 2 flew past Neptune in August 1989.',
      },
    },
    commander: {
      report: [
        'Neptune radiates about 2.6 times more energy than it receives from the Sun, an internal heat source that helps drive zonal winds of about 2,100 km/h, the fastest measured on any planet. Voyager 2 imaged the Great Dark Spot, an anticyclone that had disappeared by the time the Hubble Space Telescope observed the planet in 1994.',
        'Triton orbits Neptune in the retrograde direction, strong evidence that it was captured from the Kuiper Belt. Voyager 2 observed active nitrogen geyser plumes rising about 8 km above its frozen surface, which at about −235°C is one of the coldest measured in the Solar System.',
      ],
    },
  },
  deepspace: {
    cadet: {
      story: 'Five spacecraft are flying so far away that they are leaving our Sun’s neighborhood!',
    },
    astronaut: {
      text: 'Past Neptune, the Sun’s [[solar wind]] blows a giant bubble called the [[heliosphere]]. Voyager 1 and Voyager 2 have crossed its edge into [[interstellar]] space. Pioneer 10, Pioneer 11 and New Horizons are on paths that will also leave the Solar System. Their radio signals take many hours to reach Earth, even at the speed of light.',
      quiz: {
        q: 'What is the heliosphere?',
        options: ['The bubble blown by the solar wind', 'A ring of asteroids', 'A cloud of gas around Earth'],
        answer: 0,
        why: 'The solar wind inflates the heliosphere until it meets the gas between the stars.',
      },
    },
    commander: {
      report: [
        'The heliopause marks where the outward pressure of the solar wind balances that of the interstellar medium. Voyager 1 crossed it in August 2012 at about 121.6 au, and Voyager 2 in November 2018 at about 119 au; plasma instruments recorded the jump in electron density that defines the boundary.',
        'Both Voyagers are powered by radioisotope thermoelectric generators whose output falls by about 4 watts per year, forcing engineers to switch off instruments progressively. New Horizons, after its 2015 Pluto flyby, imaged the Kuiper Belt object Arrokoth in 2019 and found a contact binary formed by a gentle merger, evidence for local gravitational collapse in the early solar nebula.',
      ],
    },
  },
};

// Commander comparison: each robot's main goal and its key instrument.
export const ROBOT_SPEC = {
  'mariner-10': { goal: 'First close look at Mercury and Venus', instrument: 'Twin TV cameras on telescopes' },
  messenger: { goal: 'Map and analyze all of Mercury from orbit', instrument: 'Gamma-ray and neutron spectrometer' },
  'mariner-2': { goal: 'Take Venus’s temperature on a flyby', instrument: 'Microwave radiometer' },
  'pioneer-venus': { goal: 'Sample the atmosphere and map the surface', instrument: 'Four entry probes and a radar altimeter' },
  magellan: { goal: 'Map Venus through its clouds', instrument: 'Synthetic aperture radar' },
  'surveyor-1': { goal: 'Test a soft landing before Apollo', instrument: 'TV camera and footpad strain gauges' },
  lro: { goal: 'Map the Moon for future explorers', instrument: 'LROC cameras and LOLA laser altimeter' },
  grail: { goal: 'Map the Moon’s gravity field', instrument: 'Ka-band ranging between twin craft' },
  'viking-1': { goal: 'Search for life on Mars', instrument: 'Biology experiments and mass spectrometer' },
  sojourner: { goal: 'Prove a small rover could drive on Mars', instrument: 'Alpha proton X-ray spectrometer' },
  spirit: { goal: 'Find evidence of past water in Gusev', instrument: 'Pancam and Mini-TES' },
  opportunity: { goal: 'Find evidence of past water in Meridiani', instrument: 'Mössbauer spectrometer and Pancam' },
  phoenix: { goal: 'Dig into Martian arctic ice', instrument: 'Robotic arm and wet chemistry lab' },
  curiosity: { goal: 'Judge whether Gale Crater was habitable', instrument: 'Sample Analysis at Mars (SAM)' },
  insight: { goal: 'Study the deep interior of Mars', instrument: 'SEIS seismometer' },
  perseverance: { goal: 'Seek ancient life and cache samples', instrument: 'SHERLOC, PIXL and sample coring drill' },
  ingenuity: { goal: 'Demonstrate powered flight on Mars', instrument: 'Coaxial rotors and navigation camera' },
  galileo: { goal: 'Orbit Jupiter and probe its atmosphere', instrument: 'Atmospheric probe and magnetometer' },
  juno: { goal: 'Reveal Jupiter’s interior and origin', instrument: 'Microwave radiometer and gravity science' },
  cassini: { goal: 'Study Saturn, its rings and moons', instrument: 'Huygens probe and radar' },
  'voyager-1': { goal: 'Tour Jupiter and Saturn, then interstellar space', instrument: 'Plasma wave and magnetometer' },
  'voyager-2': { goal: 'Grand Tour of all four giant planets', instrument: 'Plasma science and imaging' },
  'pioneer-10': { goal: 'First crossing of the asteroid belt to Jupiter', instrument: 'Imaging photopolarimeter' },
  'pioneer-11': { goal: 'Scout Jupiter and Saturn', instrument: 'Charged particle and imaging instruments' },
  'new-horizons': { goal: 'First flyby of Pluto and a Kuiper Belt object', instrument: 'LORRI camera and Ralph imager' },
};

// Split "[[term]]" and "[[shown|term]]" markers into text and word parts.
export function parseMarked(text) {
  const parts = [];
  const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    parts.push({ text: m[1], term: (m[2] || m[1]).toLowerCase() });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last) });
  return parts;
}

export function plainText(text) {
  return parseMarked(text)
    .map((p) => p.text)
    .join('');
}
