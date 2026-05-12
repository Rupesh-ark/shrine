# Three.js Performance Findings

Date: 2026-05-11

This document records what we learned from profiling the portfolio and from
checking current React Three Fiber, Drei, and three.js performance guidance.
It is written as a working backlog, not as a finished architecture decision.

## Experience Contract

The app is a cinematic scroll-driven portfolio:

- Entry gate blocks the experience until the shrine scene is ready.
- The first click starts audio and begins the gate transition.
- Page scroll drives the camera from an exterior shrine view into the house.
- Near the end, a resume scroll overlay unfurls and has its own inner scroll.
- Desktop has overlay side navigation; mobile intentionally does not.

Performance work should preserve that staging. The goal is not to make the app
static. The goal is to avoid loading, compiling, animating, or drawing things
outside the part of the journey where they matter.

## Primary Sources Checked

- React Three Fiber performance pitfalls:
  https://r3f.docs.pmnd.rs/advanced/pitfalls
- React Three Fiber scaling performance:
  https://r3f.docs.pmnd.rs/advanced/scaling-performance
- Drei AdaptiveDpr:
  https://drei.docs.pmnd.rs/performances/adaptive-dpr
- Drei AdaptiveEvents:
  https://drei.docs.pmnd.rs/performances/adaptive-events
- Drei PerformanceMonitor:
  https://drei.docs.pmnd.rs/performances/performance-monitor
- Drei Preload:
  https://drei.docs.pmnd.rs/performances/preload
- Drei Instances:
  https://drei.docs.pmnd.rs/performances/instances
- Drei Detailed:
  https://drei.docs.pmnd.rs/performances/detailed
- three.js InstancedMesh:
  https://threejs.org/docs/pages/InstancedMesh.html
- three.js disposal guide:
  https://threejs.org/manual/en/how-to-dispose-of-objects.html
- three.js optimize lots of objects:
  https://threejs.org/manual/en/optimize-lots-of-objects.html
- three.js WebGLRenderer info:
  https://threejs.org/docs/pages/WebGLRenderer.html

## Guidance That Matters Here

R3F warns that creating objects can be expensive because materials and lights
compile and geometries are processed. It recommends sharing materials and
geometries, using instancing for repeated objects, avoiding React state in
`useFrame`, reusing temporary objects to avoid garbage collection, and using
visibility instead of runtime remounts when repeated mount/unmount would cause
compilation churn.

R3F also recommends on-demand rendering when scenes can come to rest. This app
cannot be fully on-demand during the scroll journey because camera movement,
particles, and shaders animate continuously after entry. It can still use the
same principle locally: pause per-frame work for scene pieces outside the
current journey phase.

Drei `Preload all` compiles all scene materials, including invisible ones. That
reduces later shader jank but increases readiness cost. Use it deliberately:
precompile the shell that must be ready for entry, not every optional prop.

Drei `PerformanceMonitor`, `AdaptiveDpr`, and `AdaptiveEvents` are already in
the right family of tools for this app. `PerformanceMonitor` should control
more than DPR: it can also lower particle counts, skip postprocessing, reduce
lights, or disable decorative systems.

three.js docs reinforce that many similar meshes should be merged or instanced
to reduce draw calls. They also make clear that removing an object does not
automatically dispose geometries, materials, textures, render targets, or
postprocessing passes.

## Profiling Evidence From This Run

Artifacts from the weak-device walkthrough:

- `profile-desktop-6x-entry-and-scroll.json`
- `profile-mobile-6x-entry-and-scroll.json`
- `lighthouse-desktop-6x/report.json`
- `lighthouse-mobile-6x/report.json`

Observed trace facts:

- Desktop LCP: about 4714 ms, LCP node was the HTML `H1`.
- Mobile LCP: about 4726 ms, LCP node was the HTML `H1`.
- CLS was effectively zero on both profiles.
- Longest interactions were dominated by presentation delay, not JavaScript
  processing.
- Secondary scene assets started around 7.6s to 8.7s in the dev trace:
  bamboo GLB, table GLB, DRACO, HDR, custom font, and texture assets.
- Lighthouse MCP did not run the Performance category. It only reported
  Accessibility, Best Practices, SEO, and Agentic Browsing.
- Lighthouse's only reported failure was missing or incomplete `llms.txt`.

Important caveat: these traces were captured from the Vite dev server. Dev mode
exaggerates request fanout because source modules are served individually.
Production preview should be profiled before treating any timing as final.

## Current App-Specific Findings

### Good Existing Work

- `CanvasScene` stops the R3F frame loop before entry with
  `frameloop={entered ? 'always' : 'never'}`.
- `useCameraAnimation` already returns early while the gate overlay is visible.
- `HouseModel` throttles its canvas screen texture to about 15 FPS.
- `BambooForest` does distance culling every about 400 ms instead of every
  frame.
- `useScrollProgress` uses RAF throttling and recomputes cached scroll metrics
  on resize/orientation changes.
- `PerformanceMonitor`, `AdaptiveDpr`, and `AdaptiveEvents` are already present.

### Main Problems

1. Some objects are loaded or prepared before they visually matter.
   `TableWithCushions`, `TableScroll`, `InteriorDecor`, and `BambooForest` mount
   as part of initial scene readiness. `Table.tsx` and `BambooForest.tsx` also
   have module-scope `useGLTF.preload(...)`.

2. Some per-frame systems run after their phase is visually finished.
   Door animation, door/screen canvas texture updates, sky uniforms, particles,
   mist, and spirit animations can be paused or lowered by progress.

3. Production preloads include postprocessing.
   `scripts/postbuild.mjs` injects `vendor-postprocessing` as a modulepreload,
   but postprocessing is only used after entry and is disabled on low tier.

4. Bamboo is currently cloned, not instanced.
   Drei `Clone` is convenient, but a forest of repeated clumps is the kind of
   case where instancing or merging can lower draw-call overhead.

5. The profile image is larger than display needs.
   `Rupesh_Pandey.webp` is about 298 KB and 700 x 686, while the trace showed it
   displayed around 204 x 200.

6. `Preload all` can compile too much.
   In this app it may be compiling optional/interior/exterior pieces that are not
   required for the first interactive frame.

## Recommended Backlog

### P0: Measure Production Correctly

- Run `npm run build`.
- Run `npm run preview -- --host 127.0.0.1`.
- Repeat the Chrome walkthrough against the preview URL, not Vite dev.
- Capture `renderer.info.render.calls`, triangles, geometries, textures, and
  programs at key progress points: `0`, `0.25`, `0.5`, `0.85`, `1`.

Why: current traces are useful, but production bundling changes the network and
module behavior substantially.

### P1: Add Scene Phase Gates

Create phase booleans in `Scene.tsx`, for example:

- `isExteriorPhase = progress < 0.58`
- `isDoorPhase = progress < 0.42`
- `shouldPrepareInterior = entered && progress > 0.12`
- `showInterior = progress > 0.25`
- `showResumePhase = progress > 0.82`

Use broad thresholds and hysteresis. Avoid flickering mounts when users scroll
back and forth.

Apply those flags to:

- `HouseModel`
- `BambooForest`
- `SkyDome`
- `FallingParticles`
- `GroundMist`
- `BlueSpirits`
- `RedSpirits`
- `ContactShadows`
- `PostProcessing`

Expected gain: less CPU/GPU work during the scroll journey, better battery use,
and lower frame pressure on weak devices.

### P1: Stop Door Work After It Finishes

In `HouseModel`, cache the last door open progress. Only call `animateDoors`
when the quantized value changes. When `progress >= 0.4` and the last value is
already `1`, skip.

Also gate the shoji screen canvas animation by phase:

- Run during entry/door phase.
- Stop when the camera has moved to the resume-scroll phase.
- Keep the last texture frame; no need to dispose it immediately.

Expected gain: small but very safe. It removes unnecessary per-frame mutation.

### P1: Stage Interior Loading

Do not mount `TableWithCushions`, `TableScroll`, and `InteriorDecor` as part of
entry readiness.

Suggested behavior:

- Entry readiness depends on the main house shell and essential shader compile.
- After entry, start loading interior assets in the background.
- Mount interior props shortly before the camera reaches them.
- Keep them mounted after first reveal to avoid recompile churn.

Expected gain: faster readiness and less startup work. Risk: if staged too late,
the user may see a hitch. Preload after entry avoids that.

### P1: Stage Bamboo

Remove or delay module-scope `useGLTF.preload(BAMBOO_URL)`.

Options:

- Load bamboo after entry and show it during exterior approach.
- Hide or unmount bamboo after the camera enters the house.
- Keep a low-detail or reduced clump count on mobile/low tier.

Expected gain: moderate to high. Bamboo has many clones and exists outside the
critical interior/resume part of the experience.

### P1: Lazy Postprocessing

Make `PostProcessing` a lazy import or split it so `postprocessing` is not part
of startup preloads.

Also remove `vendor-postprocessing` injection from `scripts/postbuild.mjs`.

Expected gain: lower initial JS download/parse and less critical-path work.

### P2: Replace Bamboo Clones With Instancing Or Merged Geometry

Current `BambooForest` uses many `<Clone>` instances. Research-backed options:

- Use Drei `Instances` if the bamboo can be represented by shared geometry and
  material.
- Convert the bamboo GLB into a small set of reusable geometries/materials and
  render clumps via `InstancedMesh`.
- If individual bamboo pieces never animate independently, merge static
  geometry per region.

Expected gain: lower draw calls and scene graph traversal cost. Risk: higher
implementation complexity, especially if the GLB has multiple meshes/materials.

### P2: Reduce Animated Atmosphere By Phase

Pause or hide these after they no longer contribute:

- `SkyDome` star twinkle and shooting-star simulation after the camera is inside.
- `FallingParticles` buffer mutation when the resume overlay dominates.
- `GroundMist` motion when not visible.
- `BlueSpirits` uniform updates when roof/exterior is out of view.
- `RedSpirits` sprite/light flicker after exterior phase.

Expected gain: smoother sustained scroll and lower heat/battery use.

### P2: Use PerformanceMonitor For More Than DPR

Current `PerformanceMonitor` adjusts DPR. Extend the quality model so low factor
also controls:

- Particle counts.
- Bamboo clump count.
- Contact shadow scale/blur/visibility.
- Postprocessing enablement.
- Sky star count or sky animation.
- Number/range of decorative lights.

Expected gain: better adaptation on weak devices than DPR alone.

### P2: Revisit `Preload all`

`<Preload all />` compiles invisible objects too. Consider replacing it with:

- Preload only the visible entry shell before gate readiness.
- Trigger a second staged precompile after entry for interior assets.
- Avoid precompiling bamboo/interior if they are hidden until later.

Expected gain: faster gate readiness. Risk: shader jank if staged precompile is
not timed well.

### P2: Resize Resume Image

Create responsive versions of `Rupesh_Pandey.webp`, for example:

- `Rupesh_Pandey-240.webp`
- `Rupesh_Pandey-480.webp`

Use `srcSet` and `sizes` in `AboutSection`.

Expected gain: less transfer and decode work when the resume overlay appears.

### P3: Add Renderer Info Debugging

Add a dev-only helper that logs or overlays:

- `gl.info.render.calls`
- `gl.info.render.triangles`
- `gl.info.render.points`
- `gl.info.memory.geometries`
- `gl.info.memory.textures`
- `gl.info.programs?.length`

Capture these at known progress points. This will make future changes easier to
judge than relying only on large trace files.

### P3: Add `llms.txt`

Add a small `public/llms.txt` with an H1 and short project summary. This is not
a Three.js performance item, but it fixes the only Lighthouse failure observed
in the MCP audit.

## Things To Avoid

- Do not aggressively mount/unmount large GLTF subtrees at tight scroll
  thresholds. R3F warns that runtime mounting can recompile materials and
  process geometries. Prefer visibility or one-way staged mounting.
- Do not remove the synchronous audio startup from the entry click.
- Do not raise DPR or add heavier textures while optimizing.
- Do not dispose cached GLTF resources casually if the user may scroll back to
  them. Disposal can cause a later recompile/reupload hitch.
- Do not optimize only LCP. This app's felt performance also depends on gate
  readiness, first scroll smoothness, and sustained mobile thermal behavior.

## Suggested Implementation Order

1. Production-profile baseline.
2. Lazy postprocessing and remove postprocessing modulepreload.
3. Door/screen animation gating.
4. Stage interior loading/mounting.
5. Stage bamboo loading/visibility.
6. Phase-gate atmosphere and shadows.
7. Resize responsive resume image.
8. Add renderer info dev overlay.
9. Evaluate bamboo instancing/merging after measuring draw calls.

## Success Criteria

- Gate readiness does not regress visually.
- Audio still starts from the entry click.
- No visible blank scene during scroll.
- No hitch when the interior appears.
- Resume overlay still works on desktop and mobile.
- Production trace shows lower initial JS/postprocessing cost.
- Renderer info shows lower draw calls/triangles in interior and resume phases.
- Mobile weak-device walkthrough remains complete with no console errors.
