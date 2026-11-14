# Delivery Gate 002, 14 November 2026

Mode: during (session choice). Direction: DESIGN.md. Design Read: an educational space explorer for
students and contest judges, in a mission-archive style, dial ENERGY 2 / RHYTHM 2 / MOTION 2.

## What changed in this pass

| Slop found | Rule | Fix |
| --- | --- | --- |
| Blur on top bar, menus, fact card, sheets and arrows at once | R-10 | Blur kept on the top bar only; everything else is a solid panel |
| Glow on main buttons, rank card, nav hover, rail dot, robot rows, listen button | R-13 | Removed; two marker glows remain (pick ring, landing lights) |
| Pills on every control, chip, label and badge | R-11 | Radius scale: 6px controls, 10px panels, circles only for round things |
| Uppercase wide-tracked eyebrows (rank level, fact eyebrow, robot type, planet label, report tags) | R-06 | Sentence case, muted grey |
| Colored stripes on word cards, term card, report | Part 1, Colored Left Stripe | Removed |
| Capsule chips repeating the rank next to headings | R-09 | Removed; counts kept as plain meta text |
| Two cobalt buttons competing on the Cadet slide | Liveliness, one focal point | Listen to Story is now outlined; cobalt stays on the main action |
| Blue pill labels in 2D and 3D | R-11, R-20 | Callout labels on a leader line (identity motif) |
| Rounded thin-stroke icon look | R-04 | Square ends and miter joins, drafting-style line work |
| Em dash used as an empty value in telemetry | R-02 | Replaced with "Not known" |
| Infinite pulse on the pick ring | R-39 | Plays twice, then rests |
| Rapid taps lost answers in Decode and the log order | R-26 | Functional state updates |
| Next and previous arrows did not move the slider where smooth scrolling stalls | R-26, C-4 | Falls back to an instant jump |
| 2D/3D buttons 32 x 34 px on phones | R-03 | Every top bar control has a 44 px touch area |
| Orbiting robot label ran into the stop dots on phones | R-03 | Smaller orbit on phones |

## Block 1: Hard Gate

- R-02 PASS: searched `src` and `index.html`, no em dash in UI text.
- R-03 PASS: at 375 x 812, document width 375 (no overflow); top bar touch areas measured 44 x 46, 54 x 46, 44 x 44, 44 x 44, 44 x 46, 44 x 46.
- R-17 PASS: every number comes from the NASA sources listed in README.md (mission pages, Horizons).
- R-18 PASS: no testimonials.
- R-23 PASS: no logo or people images invented; the name is set in type.
- R-24 PASS: the only nav items are menus that open and the two ⋮ entries; Report a Bug goes to the real GitHub issues page.
- R-25 PASS: text is #FFFFFF or #CBD5E1 on #030508 / #0A0E17; small blue text uses #6F9CF5 (about 6:1 on #0A0E17).
- R-26 PASS: see click-through below; no control without an action.
- R-27 PASS: robot photos have loading and error states, lists have an empty state, 3D has a loading note and a 2D fallback on error.
- R-28 PASS: no FAQ.
- R-32 PASS: all controls are native buttons or links; Escape closes menus, the fact card and sheets; the global focus ring (2px outline) is unchanged.
- R-33 PASS: this pass edited the source files directly with the editor; no patch scripts.
- R-34 PASS: one theme only, no toggle shipped (reason in DESIGN.md).
- R-35 PASS: built with Vite and clicked through in the browser, console clean. Record:
  - Visual Overlay: opens, a switch changes state, Escape closes it.
  - Learn: opens, Astronaut chosen, menu closes, label shows Astronaut.
  - Astronaut word: tapping "elliptical orbit" opens its meaning card.
  - Quick Mission Check: answer A shows "Correct!" with the reason.
  - Commander Decode: three chips fill three blanks, Check shows "3 of 3 correct", Reset empties the blanks.
  - Commander comparison table: 2 rows for Mercury.
  - Pause: aria-pressed false to true and back.
  - ⋮ menu: shows User Guide and Report a Bug; User Guide opens and Close shuts it.
  - Next / Previous / rail / ArrowLeft: Mercury to Venus to the Moon, back to Venus, rail to Saturn, ArrowLeft to Jupiter.
  - Planet tap: opens the Mercury fact card; Escape closes it.
  - Robot tap (Mariner 10 in orbit): fact card, Read its story opens its page with telemetry values.
  - Log order challenge: four taps give a score and Try again.
  - Back to list: closes the robot page.
  - Main button: opens the Mercury robot list with 2 rows.
  - 2D to 3D: canvas mounts, back to 2D.
  - Phone 375 x 812: no overflow; Space Word Cards opens its sheet.
- R-36 PASS: no security, compliance or performance claims.
- R-37 PASS: direction from DESIGN.md, Design Read declared above.
- R-38 PASS: all content is from NASA sources or labeled as drawn in the User Guide.
- R-39 PASS: base CSS sets cursor pointer on buttons, links, labels with inputs, summary, select; disabled shows not-allowed; icon-only buttons have aria-label; images have alt; hover and active states on every control; motion stops with Pause and under reduced motion; `lang`, `title`, header, main and one h1 present; zoom not blocked.
- R-40 PASS: images carry width and height; no third-party script in head. Performance not measured.

## Block 2: Purpose-Gate

- R-01 PASS: the only gradient is the globe shading (reason in DESIGN.md).
- R-04 PASS: icons drawn for the site and tied to their action; emoji only on word cards, for young readers.
- R-06 PASS: no uppercase tracking; Archivo and Plex reasons in DESIGN.md.
- R-07 PASS: the starfield is the subject (space), not a decorative grid.
- R-08 PASS: no arrows on buttons; the back arrow and row chevron show direction.
- R-09 PASS: no decorative badges; status tags are real states.
- R-10 PASS: one blurred element, the top bar.
- R-12 PASS: shadows only on the two floating layers (menus, fact card).
- R-13 PASS: two glows, both markers.
- R-14 PASS: robot rows vary by content; the three equal word cards are equal on purpose (reason in levels.css).
- R-19 PASS: motion has a purpose (orbit, arrival, drift) and stops with Pause.
- R-22 PASS: no stock illustrations; NASA photos only.

## Block 3: Liveliness

- Dials set: ENERGY 2 / RHYTHM 2 / MOTION 2. YES
- Output matches: one consistent slider, a briefing panel that changes by rank, moving but calm scenes. YES
- One focal point per screen: the planet, with one cobalt action below it. YES
- Structural whitespace: slide, briefing and robot list are separated by space, not boxes. YES
- One deliberate accent: NASA cobalt on the main action. YES
- Identity motif: callout labels on leader lines, and the orbital plane line under the worlds. YES
- Design Read declared. YES

## Block 4: Craftsmanship and Quality Locks

- C-1 to C-5: no AI-default-only decisions, no dead controls, no template sections, works at 375 px and by keyboard, no invented claims. PASS
- R-05, R-11, R-15, R-16, R-20, R-21, R-29, R-30, R-31: no template layout, radius scale in place, specific CTAs ("See the 2 robots that visited Mercury"), no buzzwords, own identity, dark theme with a reason, black plus one blue accent, not a clone, reasons written in DESIGN.md. PASS

Result: PASS. Nothing committed or deployed in this pass.
