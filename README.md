# IronCyber Flagship Immersive Experience

A production-oriented **Vite + React + TypeScript** rebuild of IronCyber's website with a premium WebGL-first storytelling layer and reliable fallback behavior for mainstream devices.

## Stack
- **Vite + React + TypeScript** for fast iteration and maintainable component structure.
- **Three.js via React Three Fiber + Drei** for interactive 3D hero and threat globe rendering.
- **GSAP + ScrollTrigger** for chapter reveal and scroll-driven motion orchestration.

## Features implemented
- Sticky global shell with smart controls: sound toggle, motion toggle, chapter nav.
- Real-time hero scene with red-vs-blue energy forms and pointer-reactive composition.
- Scroll chapter architecture:
  - Why IronCyber
  - Ukrainian Expertise
  - Simulation Scenarios
  - Industries & Ecosystem
  - Threat Globe
  - Defense Grid mini module
  - Team
  - Contact
- Data-driven scenario and industry content from `src/config/content.ts`.
- Interactive threat globe using efficient point-cloud rendering.
- Gamified “Defense Grid” micro-experience with replayable readiness state.
- Premium enterprise contact section.

## Local development
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm run preview
```

## Deployment
GitHub Pages workflow (`.github/workflows/deploy-pages.yml`) builds with Node 20 and deploys `dist/`.

## Project structure
- `src/App.tsx` — page shell, sections, interaction toggles, chapter flow.
- `src/components/HeroScene.tsx` — hero WebGL scene and energy forms.
- `src/components/ThreatGlobe.tsx` — globe-style data visualization module.
- `src/config/content.ts` — centralized content/config data.
- `src/styles/global.css` — design tokens, layout, responsive visual system.

## Performance strategy
- Keep geometry procedural/basic where possible.
- Use point-cloud rendering for threat map instead of heavy meshes.
- Keep section visuals modular so heavy modules can be lazy-loaded later.
- Maintain an adaptive quality indicator and mobile simplification.

## Fallback and accessibility strategy
- Core content remains semantic HTML over 3D visuals.
- Motion can be reduced via user toggle and OS reduced-motion preference.
- Form and all conversion-critical content stay accessible without advanced rendering.
- Visual effects remain secondary to clarity and usability.

## Integration points
- Replace static `scenarios` and `industries` data in `src/config/content.ts` with CMS/API payloads.
- Wire contact form to backend endpoint in `src/App.tsx` form submit handler.
- Replace simulated threat globe data generation with real telemetry adapter.
