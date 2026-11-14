# Delivery Gate 003, 14 November 2026

Mode: during (session choice). Direction: DESIGN.md. Design Read unchanged: educational space explorer, mission-archive
style, ENERGY 2 / RHYTHM 2 / MOTION 2.

## What changed

- Learn ranks now change astronomy depth, not language practice:
  - Cadet, Basic Space Exploration: Audio Briefing, Fun Space Facts (size against Earth drawn to scale, length of a
    solar day, robots that visited; deep space shows Voyager 1's distance, light time and craft count).
  - Astronaut, Planetary Science & Missions: science paragraph with tappable terms, Inspect Orbit Path (2D dashed
    paths, 3D lines for every orbiter and flyby), Space Mission Quiz.
  - Commander, Astrophysics & Telemetry Data: astrophysics report, Planetary Telemetry & Mission Specs (diameter,
    mass, gravity, distance, orbital period, solar day, plus mission specs and instruments; deep space lists distance,
    speed and light time per craft), Mission Debrief.
- Planet numbers from the NASA planetary fact sheets (src/data/planetData.js), credited in the User Guide and README.
- Uranus's rings turn slowly in 3D, with brighter clumps in the epsilon ring so the motion is visible.
- Points 1 to 3 of the request were already in place: #030508 / #0A0E17 surfaces, blue only as accent, stars about
  85% slower, no ring or rock belt around Mercury, only real robots per world.

## Block 1: Hard Gate

- R-02 PASS: no em dash in UI text (searched `src`).
- R-03 PASS: 375 x 812, document width 375; Inspect from the phone sheet closes the sheet and shows the paths.
- R-17 / R-36 / R-38 PASS: every number comes from the NASA fact sheets, mission pages or Horizons, and each source is
  named in the User Guide and README.
- R-26 / R-35 PASS, click-through on the dev build, console clean:
  - Learn menu shows "Level 1 · Basic Space Exploration", "Level 2 · Planetary Science & Missions", "Level 3 · Astrophysics & Telemetry Data".
  - Cadet Mercury: Audio Briefing button and cards "0.38 × Earth", "1 day = 176 Earth days", "2 robots".
  - Cadet Mars: "0.53 × Earth", "1 day = 24.7 hours", "9 robots". Deep space: "172 × farther", "24 hours", "5 robots".
  - Astronaut Mercury: Inspect Orbit Path on (aria-pressed true, 3 path shapes in 2D: MESSENGER orbit and Mariner 10
    flyby), off removes them; 3D shows the MESSENGER orbit and the Mariner 10 flyby line.
  - Astronaut Mars: no Inspect button, because all nine Mars robots are on the surface.
  - Space Mission Quiz answer shows "Correct!" with the reason.
  - Commander Mercury: telemetry rows for diameter, mass, gravity, distance, orbital period, solar day, then mission
    specs for Mariner 10 and MESSENGER. Deep space: distance, speed and light time for each craft.
  - Curiosity page at Cadet: Space briefing with Audio Briefing and three cards (Rover, Launched 2011, Active).
- R-39 PASS: new controls are native buttons with text; Inspect uses aria-pressed; drawings are aria-hidden.
- Other Hard Gate items unchanged from gate 002 and still pass.

## Blocks 2 to 4

- Accent use: the Inspect button turns cobalt only while on; paths use the same cobalt; no new glow, blur or pill.
- The three Fun Space Facts cards are equal on purpose (three facts of equal weight), reason in levels.css.
- Dials, focal point, motif and quality locks unchanged from gate 002. PASS

Result: PASS. Not committed or deployed.
