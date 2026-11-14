# Design direction

Reading this as: an educational explorer for hackathon judges and curious visitors, in a mission-archive
style, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

The project name is HEXATOUR, from the team's presentation. There is no logo, only the name set in type.

## Why each choice

- **Dark theme, no light toggle.** The subject is planets photographed against space. A white page would
  fight every image on it.
- **One accent: foil gold (`#e8b04a`).** It is the color of the gold insulation on spacecraft. It marks
  the one main action per screen, the current stop on the rail, links, and the "Left on site" label.
- **Green and grey are status colors only.** Active is green, Ended is grey. Each status also has its own
  shape and word, so it never depends on color.
- **Archivo, set wide, for headings.** Wide grotesque lettering echoes the lettering painted on NASA
  hardware. IBM Plex Sans for body text because it reads like a technical document, which this is.
- **The line under the planets.** Every world sits on one thin line: the plane the planets orbit in. It is
  the motif that ties the slider, the rail of stops, and the journey timeline together.
- **Rows, not cards, for robots.** A world can have nine robots. Rows scan faster than a card grid and
  keep the status labels in one column.
- **Globe shading gradient.** The only gradient on the page. It shades the flat map so the disc reads as
  a sphere lit from the upper left. The 3D view uses the same light direction.
- **Motion.** Planets turn slowly, slides ease into the center, panels slide in from the edge they are
  attached to. All of it stops with "Pause motion", and starts paused for visitors who ask their system
  for reduced motion.
- **Phone layout.** One world per screen, swiped up and down, with the robot list in a sheet from the
  bottom where the thumb is. Desktop slides sideways with the detail panel on the right, so the planet
  stays in view.

## Honest gaps

- Uranus has no NASA surface map in the sources used, so its surface is drawn and labeled as drawn.
- Saturn's rings are drawn.
- Spacecraft distances are a straight-line estimate from NASA/JPL Horizons values for 14 November 2026.
