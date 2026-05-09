# Project Guide

This repo is a Vite + React 19 + TypeScript portfolio built as a scroll-driven Three.js experience. The app is intentionally cinematic, with a Japanese-inspired shrine scene, layered HTML overlays, and audio tied to user entry.

## Main Entry Points

- `src/main.tsx`: React bootstrap.
- `src/App.tsx`: top-level shell, scroll progress, entry gate, audio setup, and overlays.
- `src/components/CanvasScene.tsx`: R3F canvas setup, renderer tuning, and scene wiring.
- `src/components/Scene.tsx`: scene composition, lighting, ground, house, atmosphere, and shader precompile flow.
- `src/hooks/useCameraAnimation.ts`: scroll-driven camera motion and CSS origin updates.
- `src/hooks/useScrollProgress.ts`: normalized page scroll state with RAF throttling.
- `src/components/sections/*`: content overlays for hero, projects, skills, career, education, and contact.

## Stack And Conventions

- Use TypeScript and functional React components.
- Follow the existing style: inline styles in UI layers, local constants for tuning values, and memoization only where it already fits the pattern.
- Keep React Three Fiber, Drei, and Three.js code lean. Avoid unnecessary per-frame allocations or extra renders.
- Keep large assets in `public/` and update paths carefully if they move.
- Do not edit `dist/` directly.

## Performance Constraints

- Preserve the current mobile/desktop split in camera and renderer settings.
- Avoid raising DPR, adding heavy textures, or introducing expensive work inside `useFrame`.
- Keep the scene loading flow intact: entry gate, model readiness, shader precompile, then the main experience.
- Prefer stable asset URLs or build hashes for large models and textures; avoid `Date.now()` cache busting unless you explicitly need to defeat caching.

## Review Checklist

- Keep user-gesture-dependent audio startup synchronous; do not move first-play `audio.play()` behind `requestAnimationFrame` or other async hops.
- Recompute cached scroll metrics on resize or orientation changes.
- Scope observers and effects to mount or visibility state, not rapidly changing scroll progress.
- Keep adaptive DPR values monotonic; never pass a max below the minimum.
- Avoid browser-only APIs at module scope unless the file is guaranteed client-only.
- Treat `ScrollOverlay.tsx` as high-risk on Firefox Android; re-test touch scrolling and overscroll behavior after any scroll-related change.

## Verification

- `npm run lint`
- `npm run build`
- For visual or scene changes, also run `npm run dev` and check both desktop and mobile behavior.

## Useful Notes

- `npm run build` also triggers the `postbuild` step.
- Bundle visualization is configured through Vite and writes `dist/stats.html`.
- The repo already contains the main README with the portfolio overview; keep this file focused on agent workflow and codebase rules.
