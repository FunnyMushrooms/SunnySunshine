import { useEffect, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroScene } from './components/HeroScene';
import { ThreatGlobe } from './components/ThreatGlobe';
import { industries, navItems, scenarios } from './config/content';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [score, setScore] = useState(0);

  const quality = useMemo(() => (window.innerWidth > 1200 ? 'HIGH' : window.innerWidth > 768 ? 'MED' : 'LOW'), []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    gsap.utils.toArray<HTMLElement>('.chapter').forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0.45, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 78%' } }
      );
    });
  }, [reducedMotion]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a href="#hero" className="brand">Iron<span>Cyber</span></a>
        <nav>
          {navItems.map((item) => (
            <a key={item.id} href={`#${item.id}`}>{item.label}</a>
          ))}
        </nav>
        <div className="toggles">
          <button onClick={() => setMuted((v) => !v)}>{muted ? 'Sound Off' : 'Sound On'}</button>
          <button onClick={() => setReducedMotion((v) => !v)}>{reducedMotion ? 'Motion: Reduced' : 'Motion: Full'}</button>
        </div>
      </header>

      <main>
        <section id="hero" className="hero chapter">
          <div className="hero-copy">
            <p className="eyebrow">Red and Blue Equals Iron</p>
            <h1>Operational cyber resilience for enterprise and national-scale environments.</h1>
            <p>IronCyber designs offensive simulation and defensive readiness programs that transform teams into battle-ready cyber operators.</p>
            <div className="cta-row">
              <a href="#contact" className="cta primary">Book Demo</a>
              <a href="#scenarios" className="cta">Explore Scenarios</a>
            </div>
            <p className="meta">Render quality tier: {quality} · WebGL-enhanced with graceful HTML fallback.</p>
          </div>
          <div className="hero-canvas"><HeroScene /></div>
        </section>

        <section id="why" className="chapter panel">
          <h2>Why IronCyber</h2>
          <p>We blend red-team realism with blue-team reliability so your organization can continuously test, detect, recover, and improve.</p>
        </section>

        <section id="expertise" className="chapter panel alt">
          <h2>Ukrainian Expertise</h2>
          <p>Our experts are shaped by real operational pressure, bringing practical cyber defense methodology informed by active conflict conditions.</p>
        </section>

        <section id="scenarios" className="chapter panel">
          <h2>Simulation Scenarios</h2>
          <div className="cards">
            {scenarios.map((item) => (
              <article key={item.title}>
                <p className="tag">{item.shape}</p>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="industries" className="chapter panel alt">
          <h2>Industries and Ecosystem</h2>
          <ul className="industry-list">
            {industries.map((industry) => <li key={industry}>{industry}</li>)}
          </ul>
        </section>

        <section id="globe" className="chapter panel">
          <h2>Interactive Threat Globe</h2>
          <p>GPU point-cloud map representing simulated attack telemetry and defensive response nodes.</p>
          <div className="globe-wrap"><ThreatGlobe /></div>
        </section>

        <section id="lab" className="chapter panel alt">
          <h2>Defense Grid Mini Simulation</h2>
          <p>Activate defense controls against incoming probes. Reach score 3 for hardened posture.</p>
          <div className="lab-controls">
            <button onClick={() => setScore((s) => Math.min(s + 1, 3))}>Deploy Firewall Layer</button>
            <button onClick={() => setScore((s) => Math.min(s + 1, 3))}>Enable EDR Hunt</button>
            <button onClick={() => setScore((s) => Math.min(s + 1, 3))}>Isolate Threat Segment</button>
            <button onClick={() => setScore(0)}>Reset</button>
          </div>
          <p className="result">Readiness score: {score}/3 {score === 3 ? '— Iron Ready Badge Unlocked' : ''}</p>
        </section>

        <section id="team" className="chapter panel">
          <h2>Team</h2>
          <p>Incident commanders, reverse engineers, and platform architects operating as one response unit.</p>
        </section>

        <section id="contact" className="chapter panel contact alt">
          <h2>Book a Readiness Assessment</h2>
          <form>
            <label>Name<input type="text" required /></label>
            <label>Work Email<input type="email" required /></label>
            <label>Primary Challenge<textarea rows={4} required /></label>
            <button type="submit">Request Consultation</button>
          </form>
        </section>
      </main>
    </div>
  );
}
