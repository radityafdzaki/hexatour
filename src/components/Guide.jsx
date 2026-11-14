import { CloseIcon } from './Icons.jsx';

export default function Guide({ onClose }) {
  return (
    <article className="guide">
      <div className="robots-title">
        <h2 id="guide-title">User Guide</h2>
        <button type="button" className="close-btn" onClick={onClose}>
          <CloseIcon />
          <span>Close</span>
        </button>
      </div>

      <section>
        <h3>Travel between worlds</h3>
        <ul className="plain">
          <li>On a computer, slide sideways: drag, use the arrow buttons, or press ← and →.</li>
          <li>On a phone, swipe up and down. The dots on the right jump to any stop.</li>
          <li>Switch between the 2D and 3D views at the top. In 3D, drag a globe to turn it.</li>
        </ul>
      </section>

      <section>
        <h3>Tap things in space</h3>
        <ul className="plain">
          <li>Tap a planet, a passing asteroid or the little robot spacecraft to open a fact card.</li>
          <li>Press the speaker button to hear how a word is said.</li>
          <li>From a planet’s card, open the list of robots that went there, then pick one to read its story.</li>
        </ul>
      </section>

      <section>
        <h3>Learn at your rank</h3>
        <ul className="plain">
          <li>
            <strong>Cadet</strong>: short stories, words to know and a read-aloud voice.
          </li>
          <li>
            <strong>Astronaut</strong>: full mission logs and a word challenge on each robot page.
          </li>
          <li>
            <strong>Commander</strong>: technical briefs, a telemetry report and a comparison with other missions.
          </li>
        </ul>
      </section>

      <section>
        <h3>Visual Overlay and motion</h3>
        <ul className="plain">
          <li>The eye button shows or hides orbit lines, asteroids, planet labels and the atmosphere glow.</li>
          <li>The pause button stops every moving part. It starts paused if your device asks for reduced motion.</li>
        </ul>
      </section>

      <section>
        <h3>Status labels</h3>
        <ul className="plain">
          <li>Active: the mission is still running.</li>
          <li>Ended: it stopped working, or contact was lost.</li>
          <li>Left on site: the robot, or part of it, is still at the place it explored.</li>
        </ul>
      </section>

      <section className="credits">
        <h3>Sources and credits</h3>
        <p>
          Mission facts and photos come from{' '}
          <a href="https://science.nasa.gov/" target="_blank" rel="noreferrer">
            NASA Science
          </a>{' '}
          and the{' '}
          <a href="https://images.nasa.gov/" target="_blank" rel="noreferrer">
            NASA Image and Video Library
          </a>
          . Planet maps come from{' '}
          <a href="https://github.com/nasa/NASA-3D-Resources" target="_blank" rel="noreferrer">
            NASA 3D Resources
          </a>{' '}
          and{' '}
          <a href="https://trek.nasa.gov/" target="_blank" rel="noreferrer">
            NASA Solar System Treks
          </a>
          . Spacecraft distances come from{' '}
          <a href="https://ssd.jpl.nasa.gov/horizons/" target="_blank" rel="noreferrer">
            NASA/JPL Horizons
          </a>
          .
        </p>
        <p>
          The surface of Uranus, Saturn’s rings, the asteroids and the robot models in space are drawn by code. Distances
          use a straight-line estimate from Horizons values for 14 November 2026.
        </p>
        <p>Made for the 2026 NASA Space Apps Challenge. This site is not endorsed by NASA.</p>
      </section>
    </article>
  );
}
