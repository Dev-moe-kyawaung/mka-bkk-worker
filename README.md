# Dario Vlas — Senior Mobile Engineer

A scroll-driven 3D portfolio for a senior mobile engineer specialising in Flutter, Kotlin, and
cross-platform architecture. Five scenes, one camera, one shared scroll value.

Built as an **Expo + React Native + TypeScript** application so the same build runs on iOS,
Android, and the web — Reanimated 4 worklets replace GSAP's `ScrollTrigger` as the scrub engine,
and SVG/perspective transforms stand in for the R3F scene graph.

## The five scenes

| # | Scene                | What it does                                                                 |
| - | -------------------- | ---------------------------------------------------------------------------- |
| 00 | Hero                | Orbiting Android + Flutter marks with an iridescent gradient sweep, parallax starfield. Orbits on load, then locks to scroll. |
| 01 | Impact              | Six production metrics, scrubbed count-up as the scene enters the viewport.   |
| 02 | Selected work       | 3D device carousel — perspective + rotateY derived from scroll offset. Tap a device for the dossier. |
| 03 | Skills galaxy       | Fibonacci-sphere particle system, one node per skill, proficiency ring on select, category orbits. |
| 04 | Architecture        | Exploded view of a modular monolith: layers separate on scroll, tap for the module contract. Mermaid flow included. |
| 05 | Contact constellation | Stars form the contact signature; links draw themselves as the scene arrives. |

## Screens

- **Reel** — the five scenes, fixed nav, side progress rail, perf monitor.
- **Work** — filterable case-study list, pull to refresh, sort by year or impact.
- **Skills** — the galaxy plus a full proficiency index.
- **Contact** — constellation, channel cards, validated on-device form.
- **Case study** — slides in from the right, full markdown with fenced code and Mermaid diagrams, next/previous navigation.

## Commands

```bash
npm start            # dev server
npm run typecheck    # tsc --noEmit
npm run build        # expo export --platform all  → dist/
npm run perf:budget  # assert bundle + frame budgets, exits 1 on breach
npm run verify       # all three
```

## Performance

- All per-frame work runs in Reanimated worklets on the UI thread; React only re-renders when a
  rounded counter or the active scene actually changes.
- Particle counts scale down on narrow viewports; every particle is a pooled view driven by one
  shared clock rather than a timer per particle.
- `perf` chip in the nav toggles a live FPS/draw monitor (the R3F `<Perf>` equivalent).
- CI runs the budget gate: 640KB gzip JS, 260KB fonts, 900KB raster, 33.3ms frame floor.

## Deploy

`dist/` is a static SPA. `vercel.json` sets the output directory and rewrites deep links to
`index.html`; `.github/workflows/ci.yml` typechecks, exports, budgets, and deploys on `main`.

See `docs/ASSET_PIPELINE.md` for the vector-first asset strategy and how to drop in real
Draco-compressed GLTF + KTX2 models.
