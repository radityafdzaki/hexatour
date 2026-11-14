# Design direction

Reading this as: an educational explorer for hackathon judges and curious visitors, in a mission-archive
style, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

The project name is HEXATOUR, from the team's presentation. There is no logo, only the name set in type.

## Why each choice

- **Dark theme, no light toggle.** The subject is planets photographed against space. A white page would
  fight every image on it.
- **NASA blue, white and black.** Deep Space Black (#050811) behind everything, NASA Cobalt (#0B3D91) for the main action and the chosen rank, Electric Blue (#1E90FF) for glows and switches, Soft Sky Blue (#60A5FA) for links and highlighted text, white for type. No yellow or orange in the interface.
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
- **Depth.** A layered starfield drifts toward the viewer and shifts with the pointer and scroll. Rocks and a robot orbit every world and can be tapped for a fact card with a spoken word. The 3D view adds a day-night terminator, an atmosphere rim and Saturn's rings with the Cassini Division and the planet's shadow.
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
