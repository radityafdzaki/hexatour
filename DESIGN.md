# Design direction

Reading this as: an educational explorer for hackathon judges and curious visitors, in a mission-archive
style, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

The project name is HEXATOUR, from the team's presentation. There is no logo, only the name set in type.

## Why each choice

- **Dark theme, no light toggle.** The subject is planets photographed against space. A white page would
  fight every image on it.
- **Space black first, NASA blue as the accent.** Page #030508, panels #0A0E17. NASA blue (#0B3D91, #2563EB) only on the main buttons, active states, icons and thin borders. Text is white (#FFFFFF) and light grey (#CBD5E1); small blue text uses a lighter tint of #2563EB so it stays legible on black.
- **Dark glass top bar.** Logo, Visual Overlay and Learn on the left; 2D/3D, pause and the ⋮ menu (User Guide, Report a Bug) on the right. Credits moved from the footer into the User Guide.
- **Status in blue, white and grey.** Active is blue, Ended is grey, Left on site is white. Each status also has its own shape and word, so it never depends on color.
- **Archivo, set wide, for headings.** Wide grotesque lettering echoes the lettering painted on NASA
  hardware. IBM Plex Sans for body text because it reads like a technical document, which this is.
- **The line under the planets.** Every world sits on one thin line: the plane the planets orbit in. It is
  the motif that ties the slider, the rail of stops, and the journey timeline together.
- **Rows, not cards, for robots.** A world can have nine robots. Rows scan faster than a card grid and
  keep the status labels in one column.
- **Globe shading gradient.** The only gradient on the page. It shades the flat map so the disc reads as
  a sphere lit from the upper left. The 3D view uses the same light direction.
- **Depth, calmly.** Stars drift in ultra slow motion with a gentle shimmer, dimmer behind the text in the middle. Each world shows only its real robots: orbiters circle it, flybys pass once, landers and rovers glow at their landing sites. Rings appear only on Saturn and Uranus; asteroids appear only near the belt (Mars, Jupiter) and in deep space.
- **Three ranks that change the page.** Cadet: a short story, a big Listen to Story button and three Space Word Cards. Astronaut: a science paragraph with tappable words and a Quick Mission Check. Commander: a two-part technical report, a Telemetry & Technical Comparison table and a Decode & Summarize exercise.
- **Motion.** Planets turn slowly, slides ease into the center, panels slide in from the edge they are
  attached to. All of it stops with "Pause motion", and starts paused for visitors who ask their system
  for reduced motion.
- **Phone layout.** One world per screen, swiped up and down, with the robot list in a sheet from the
  bottom where the thumb is. Desktop slides sideways with the detail panel on the right, so the planet
  stays in view.

## Honest gaps

- Uranus has no NASA surface map in the sources used, so its surface is drawn and labeled as drawn.
- Saturn's rings, the asteroids and the robot models are drawn by code.
- Spacecraft distances are a straight-line estimate from NASA/JPL Horizons values for 14 November 2026.
