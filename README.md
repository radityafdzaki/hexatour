# HEXATOUR

Team: Hexagon is the Bestagon (Raditya Fahru Dzaki, Harley Virya Mandala, Martin Luther Septiandy).

Slide through the worlds NASA robots have visited, pick a world to see its robots, and open a robot to
read its mission, status, science, people and sources.

## Run it

```bash
npm install
npm run dev
```

Build a static copy for hosting with `npm run build`. The result is in `dist/`.

## Live site

https://radityafdzaki.github.io/hexatour/

To publish a new version, run `npm run deploy`. It builds the site and pushes `dist/` to the
`gh-pages` branch, which GitHub Pages serves.

## NASA data and resources used

| What | Source |
| --- | --- |
| Mission facts, dates and status | NASA Science mission pages, https://science.nasa.gov/ |
| Robot photos | NASA Image and Video Library, https://images.nasa.gov/ |
| Venus, Mars, Jupiter, Saturn and Neptune maps | NASA 3D Resources, https://github.com/nasa/NASA-3D-Resources |
| Moon and Mercury maps | NASA Solar System Treks, https://trek.nasa.gov/ |
| Distances of the deep-space craft | NASA/JPL Horizons, https://ssd.jpl.nasa.gov/horizons/ |

Each robot page links to its own NASA source pages.

## Other tools

React, Vite and three.js (all open source). Fonts: Archivo and IBM Plex Sans (SIL Open Font License).

## Use of AI

The code and the written summaries were produced with an AI coding assistant (Claude) and checked against
the NASA pages listed above. No images, audio or video on the site are AI-generated. The surface of
Uranus, the rings of Saturn, the asteroids and the robot models in space are drawn by code. Spoken words use
the browser's built-in speech voice.

## Things to check before submitting

- The status of Juno could not be confirmed past NASA's published plan (extended mission through
  September 2025). Its page says so.
- Names and roles under "People behind it" are public mission leaders. Spot-check them against the linked
  NASA pages.
