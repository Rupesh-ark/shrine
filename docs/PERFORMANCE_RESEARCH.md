# R3F / Three.js Performance Optimization Research

Concrete, actionable techniques for scroll-driven 3D experiences, mapped to our specific issues.

---

## 1. R3F Performance Best Practices

### 1a. Avoid Re-renders from useFrame Reads

**Technique**: `useFrame` runs outside React's render cycle. State read inside `useFrame` must NOT trigger React re-renders. Use `useRef` instead of `useState` for values consumed only by the render loop.

- **Source**: https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls
- **Applies to**: ScrollOverlay re-rendering 60x/sec — progress consumed via `useSyncExternalStore` triggers React re-renders every RAF. Consider consuming progress via `useProgressRef()` (which already exists in our codebase at `useScrollProgress.ts:79`) and only reading it in `useFrame`, not as React state in ScrollOverlay.

### 1b. `frameloop="demand"` for Scroll-Driven Scenes

**Technique**: Set `<Canvas frameloop="demand">` so R3F only renders when something actually changes, instead of rendering continuously at 60fps. Invalidate manually via `useThree().invalidate()` when scroll or animation warrants a redraw.

- **Source**: https://docs.pmnd.rs/react-three-fiber/api/canvas
- **Applies to**: ScrollOverlay re-renders. Currently the canvas renders continuously. If the user isn't scrolling, the scene should be idle except for ambient animations.

### 1c. Out-of-Canvas React State Must Not Cascade into Canvas

**Technique**: Separate React state trees for HTML overlay and Canvas. DOM re-renders should not trigger R3F re-renders. Use `createRoot` isolation or `useContextBridge` only when absolutely necessary.

- **Source**: https://docs.pmnd.rs/react-three-fiber/advanced/pitfalls
- **Applies to**: App and HeroOverlay unnecessary re-renders — `useScrollProgress()` in App.tsx causes full tree re-renders every RAF.

---

## 2. Three.js Performance Tips

### 2a. BufferAttribute.needsUpdate Is Expensive

**Technique**: `needsUpdate = true` uploads the entire buffer to the GPU. Avoid setting it every frame. If only some particles moved, use `updateRange` to upload a subset, or better yet, eliminate CPU-side per-frame updates entirely by moving animation to shaders.

- **Source**: https://threejs.org/docs/#api/en/core/BufferAttribute.needsUpdate
- **Applies to**: Particles.tsx `posAttr.needsUpdate = true` on every frame. This forces a full GPU buffer upload per frame for all particle positions.

### 2b. CanvasTexture.needsUpdate Is Also Expensive

**Technique**: Each `needsUpdate = true` on a CanvasTexture causes a full texture re-upload to the GPU. For animated textures, prefer shader-based approaches or reduce update frequency.

- **Source**: https://threejs.org/docs/#api/en/textures/CanvasTexture
- **Applies to**: HouseModel.tsx `updateSealTexture` and `animateScreenParticles` set `texture.needsUpdate = true` every frame. Each uploads a 512x512 canvas to the GPU every frame.

### 2c. Matrix4 Operations in the Hot Path

**Technique**: Avoid `new` allocations and `Matrix4.invert()` in the render loop. Pre-allocate scratch objects. Use `Matrix4.copy().invert()` with cached refs rather than creating new matrices.

- **Applies to**: `useCameraAnimation.ts:174-199` — calls `camera.updateMatrixWorld()`, `camera.updateProjectionMatrix()`, matrix inversion, and `blendProjectionMatrices` every frame. Already uses refs correctly, but the `blendProjectionMatrices` does 16 element-wise lerps per frame which is fine — just confirm no allocations.

---

## 3. Drei Performance Helpers

### 3a. `<AdaptiveDpr>`

**Technique**: Drops pixel ratio during camera movement / interactions and restores it when idle. Uses the canvas's `performance` min/max settings (set via `<Canvas performance={{ min: 0.5, max: 2 }}>`).

```tsx
<Canvas performance={{ min: 0.5, max: 2 }}>
  <AdaptiveDpr pixelated />
</Canvas>
```

- **Source**: https://pmndrs.github.io/drei/performances/adaptive-dpr
- **Applies to**: General performance — when scroll is active, the DPR can drop to maintain framerate, then restore when idle.

### 3b. `<AdaptiveEvents>`

**Technique**: Disables raycasting during regression (low fps periods). Raycasting is CPU-intensive and unnecessary during scroll.

```tsx
<AdaptiveEvents />
```

- **Source**: https://pmndrs.github.io/drei/performances/adaptive-events
- **Applies to**: Our scene doesn't do much raycasting currently, but it's free insurance.

### 3c. `<PerformanceMonitor>`

**Technique**: Tracks average FPS and triggers `onIncline`/`onDecline` callbacks for adaptive quality. Can reduce particle counts, disable post-processing, lower DPR, etc.

```tsx
<PerformanceMonitor onDecline={() => setQuality('low')} onIncline={() => setQuality('high')} />
```

- **Source**: https://pmndrs.github.io/drei/performances/performance-monitor
- **Applies to**: We already have a quality system (useIsMobile). PerformanceMonitor could dynamically switch between quality tiers during runtime.

### 3d. `<Bvh>`

**Technique**: Wraps `three-mesh-bvh` to accelerate raycasting by 10-100x. Only useful if raycasting is a bottleneck.

```tsx
<Bvh firstHitOnly>
  <Scene />
</Bvh>
```

- **Source**: https://pmndrs.github.io/drei/performances/bvh
- **Applies to**: Low priority — only relevant if raycasting becomes a bottleneck.

### 3e. `<Instances>` / `<Merged>`

**Technique**: Declarative wrapper around `THREE.InstancedMesh`. Allows rendering thousands of identical geometries in a single draw call.

- **Source**: https://pmndrs.github.io/drei/performances/instances
- **Applies to**: RedFlameSprite instances (currently N separate `<sprite>` + `<pointLight>` per flame). Could batch sprites into InstancedMesh — but pointLights cannot be instanced and would need a different approach (see section 6).

### 3f. `<Points>` (from drei)

**Technique**: Optimized Points rendering with `BufferGeometry` attributes that can be animated via shaders.

- **Source**: https://pmndrs.github.io/drei/performances/points
- **Applies to**: FallingParticles and BlueSpirits already use shaders (BlueSpirits) or Points geometry (FallingParticles). BlueSpirits is already shader-driven — good pattern.

---

## 4. React 19 Performance Features

### 4a. `useSyncExternalStore` for Scroll State

**Technique**: `useSyncExternalStore` is the correct way to subscribe to external stores (like scroll position) from React. However, it triggers a re-render every time the snapshot changes. If the snapshot changes at 60fps, the component re-renders at 60fps.

**For scroll-driven 3D**: The scroll progress should be consumed via `useRef` inside `useFrame` (which is outside React's render cycle), NOT via `useSyncExternalStore` in the DOM overlay at 60fps. Instead:
1. Use `useProgressRef()` (our existing non-reactive ref) inside `useFrame` callbacks.
2. For the HTML overlay, use `useSyncExternalStore` but throttle updates — e.g., only update at 10fps or on visible section changes, not every scroll pixel.

- **Applies to**: `ScrollOverlay` calls `useScrollProgress()` which uses `useSyncExternalStore` — this causes React re-renders at 60fps. The overlay should instead use a throttled/interpolated progress for DOM updates.

### 4b. `startTransition` for Non-Urgent State Updates

**Technique**: Mark scroll-driven DOM updates (like active section index) as transitions so React can interrupt them if a higher-priority update comes in.

```tsx
startTransition(() => setActiveSection(newSection))
```

- **Applies to**: `ScrollOverlay` sets `activeSection` state on scroll. This should be wrapped in `startTransition`.

### 4c. `React.memo` for Overlay Sections

**Technique**: Memoize overlay section components so they don't re-render when parent scroll state changes but their specific section content hasn't changed.

```tsx
const HeroSection = React.memo(function HeroSection({ progress }) { ... })
```

- **Applies to**: All section components in ScrollOverlay re-render on every scroll state change because the parent ScrollOverlay re-renders. Each section should be memoed with only the props it actually needs.

---

## 5. Scroll-Driven 3D Animation — Preventing Jank

### 5a. Separate Scroll State from DOM State

**Technique**: The scroll progress should have two consumers:
1. **`useFrame` (60fps, no React renders):** Reads from a ref, drives camera, particles, animations.
2. **DOM overlay (throttled, ~10-15fps):** Uses a throttled/debounced version of progress for section visibility, CSS transforms, opacity changes.

This is the primary architectural fix for our scroll jank issue.

- **Applies to**: ScrollOverlay re-rendering 60x/sec

### 5b. CSS `will-change` and `transform3d` for Overlay Elements

**Technique**: Promote scroll-linked overlay elements to their own compositing layer with `will-change: transform` or `transform: translateZ(0)`. This keeps DOM paints off the main thread when the overlay transforms.

- **Applies to**: ScrollOverlay DOM elements that transform based on progress.

### 5c. Avoid Forcing Layout Recalculations During Scroll

**Technique**: Never read `getBoundingClientRect()`, `offsetHeight`, or other layout-triggering properties inside scroll handlers or RAF callbacks that run at 60fps. Cache layout metrics on resize only.

- **Applies to**: `useScrollProgress.ts` is already pure scroll position calculation — good. But ScrollOverlay might be doing layout reads on every render.

### 5d. requestAnimationFrame Coalescing

**Technique**: Our `useScrollProgress` already uses RAF throttling (good). But if React also schedules renders in the same frame, we get double-work. Using `useSyncExternalStore` with a "tearing" fix can cause forced synchronous layouts. Prefer the ref-based approach for critical path.

- **Applies to**: useScrollProgress's `_scheduleUpdate` pattern.

---

## 6. InstancedMesh / GPU-Instanced Rendering for Particles

### 6a. Replace CPU Particle Updates with Vertex Shader Animation

**Current problem**: `Particles.tsx` updates a `Float32Array` on the CPU every frame and sets `needsUpdate = true`.

**Solution**: Move all animation to a vertex shader. Pre-bake initial positions, speeds, and phases as attributes. Animate in the vertex shader using elapsed time.

```glsl
// vertex shader
attribute float speed;
attribute float phase;
uniform float uTime;

void main() {
  vec3 pos = position;
  float t = uTime;
  float wrapped = mod(t * speed + phase, 1.0); // normalized cycle
  pos.y = mix(topY, bottomY, wrapped);
  pos.x += sin(t * 0.5 + phase) * 0.002;
  pos.z += cos(t * 0.3 + phase) * 0.002;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
```

This eliminates both the CPU loop AND the `needsUpdate` upload. No per-frame CPU cost at all.

- **Applies to**: FallingParticles CPU-side position updates with `needsUpdate`

### 6b. InstancedMesh for Repeated Geometries (Red Flame Sprites)

**Current problem**: `RedFlameSprite` creates N separate `<sprite>` + `<pointLight>` components, each with its own `useFrame` callback. N = number of red spirit positions.

**Solution**: 
- For the sprites: Use `THREE.InstancedMesh` with a plane geometry and the glow texture, with per-instance attributes for phase, speed, and scale animated via vertex shader uniforms.
- For the lights: PointLights cannot be instanced. Options:
  1. **Reduce to 1-2 point lights total** that orbit between the key positions (fake it).
  2. **Use a single light with animated position** that averages between all flame positions.
  3. **Remove dynamic lights entirely** and bake the glow into the sprite material's emissive.

- **Applies to**: RedFlameSprite's 4+ useFrame callbacks per instance

### 6c. Instanced Rendering Pattern in Three.js

```typescript
const mesh = new THREE.InstancedMesh(geometry, material, count)
const dummy = new THREE.Object3D()

// In useFrame:
for (let i = 0; i < count; i++) {
  dummy.position.set(x, y, z)
  dummy.scale.setScalar(s)
  dummy.updateMatrix()
  mesh.setMatrixAt(i, dummy.matrix)
}
mesh.instanceMatrix.needsUpdate = true
```

More efficient: move the per-instance transform to a custom shader attribute.

- **Source**: https://threejs.org/docs/#api/en/objects/InstancedMesh

---

## 7. OffscreenCanvas / Web Worker for Three.js

### 7a. Current Viability

**Technique**: `OffscreenCanvas` allows moving the WebGL canvas to a Web Worker. This offloads rendering from the main thread entirely.

**Assessment**: **Not viable for our use case.** Reasons:
1. R3F does not natively support OffscreenCanvas — it assumes DOM access.
2. Our scroll-driven camera depends on main-thread scroll events that must be communicated to the worker via `postMessage`, adding latency.
3. React Reconciler cannot run in a worker with R3F currently.
4. Pointer events and HTML overlays would lose direct integration.

**Alternative**: Keep the canvas on the main thread but minimize main-thread work by moving all animation to shaders (section 6a) and throttling DOM overlay updates (section 5a).

- **Source**: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
- **Applies to**: Low priority — architectural incompatibility with R3F.

---

## 8. EffectComposer / Post-Processing Performance

### 8a. Reduce Post-Processing Overhead

**Technique**: Each post-processing pass adds a full-screen render target blit. Minimize the number of passes.

| Optimization | Impact |
|---|---|
| Combine passes into a single multi-effect shader | Eliminates N-1 intermediate render targets |
| Use `halffloat` or `unsigned_byte` render targets instead of `float` | ~2x less VRAM per pass |
| Disable anti-alias on intermediate render targets | Saves bandwidth |
| Reduce render target resolution for effects (e.g., bloom at 0.5x) | Quarter the fragment work |
| Use `depthWrite: false` and `depthTest: false` on post-processing quads | Eliminates depth ops |

- **Source**: https://threejs.org/docs/#api/en/renderers/post-processing/Pass
- **Applies to**: Our `PostProcessing.tsx` — need to inspect what passes we use.

### 8b. Adaptive Post-Processing with PerformanceMonitor

**Technique**: Use `<PerformanceMonitor>` to conditionally disable expensive post-processing passes when FPS drops below threshold.

```tsx
const [bloom, setBloom] = useState(true)
<PerformanceMonitor onDecline={() => setBloom(false)} onIncline={() => setBloom(true)} />
```

- **Applies to**: Could dynamically toggle bloom, vignette, etc., on low-end devices.

### 8c. Bake Static Post-Processing

**Technique**: `<BakeShadows>` from drei bakes shadow maps once instead of rendering them every frame. Similarly, if post-processing effects don't change based on camera angle, they can be pre-computed.

- **Source**: https://pmndrs.github.io/drei/performances/bake-shadows
- **Applies to**: Shadow maps could be baked if the scene is static relative to the light.

---

## 9. Canvas Texture Patterns — Alternatives to 2D Canvas per Frame

### 9a. The Problem

Our `HouseModel.tsx` updates two canvas textures every frame:
1. **Blood seal** (`drawBloodSeal` + `updateSealTexture`): 512x512 canvas, draws rectangles, arcs, lines, and drips based on ritual progress.
2. **Screen particles** (`animateScreenParticles`): Another 512x512 canvas, draws sakura petals with bezier curves, grain, and gradients.

Both set `texture.needsUpdate = true` every frame, causing a 512x512 RGBA texture upload per frame each (~1MB per texture per frame).

### 9b. Solution: Shader-Based Alternatives

#### Seal Texture → Shader Material
Replace the canvas-based seal with a `ShaderMaterial` that computes the seal pattern procedurally in the fragment shader:
- Rectangles: `step()` functions for rectangular regions
- Circles: distance field `1.0 - smoothstep(r - 0.02, r, length(uv - center))`
- Drips: Use signed distance functions (SDFs) for the drip shapes, animated via `uTime` uniform
- Cracks: Animated line segments with `smoothstep` anti-aliasing
- Fade: Control `uRitualProgress` and `uOpenProgress` uniforms

This eliminates the 2D canvas and `needsUpdate` entirely.

#### Screen Particles → PointSprite GPU Animation
Replace the 2D canvas sakura petals with GPU-animated point sprites using a `ShaderMaterial`:
- Pre-define petal positions, velocities, and lifetimes as buffer attributes
- Animate `position`, `rotation`, `opacity` in the vertex shader using `uTime`
- Draw petal shape in fragment shader using polar coordinates and `smoothstep`

This is exactly the pattern our `BlueSpirits` component already uses — it's proven in our codebase.

### 9c. Hybrid Approach: Throttled Canvas Updates

If complete shader replacement is too complex, throttle canvas updates to 15-20fps:
```typescript
const now = state.clock.elapsedTime
if (now - lastUpdateRef.current < 0.05) return // ~20fps for texture
lastUpdateRef.current = now
// ... draw to canvas ...
texture.needsUpdate = true
```

This reduces GPU upload frequency from 60fps to 20fps, saving ~2MB/frame * 40fps = ~80MB/s of VRAM bandwidth.

- **Applies to**: HouseModel 2D canvas work (sakura petals, blood seal)

---

## 10. useFrame Optimization

### 10a. Priority Ordering

**Technique**: `useFrame(callback, priority)` takes a priority number. Lower numbers execute first. Use priorities to order critical vs. non-critical work:

```tsx
useFrame((state, delta) => { /* camera: critical */ }, 0)  // highest priority
useFrame((state, delta) => { /* particles: medium */ }, 1)
useFrame((state, delta) => { /* textures: low */ }, 2)      // can be skipped
```

Non-critical callbacks can check the frame budget and bail out:
```tsx
useFrame((state, delta) => {
  if (state.clock.elapsedTime - lastTextureUpdate < 0.05) return
  // ... expensive texture work ...
}, 2)
```

- **Source**: https://docs.pmnd.rs/react-three-fiber/api/use-frame
- **Applies to**: We have 4 separate `useFrame` callbacks for RedFlameSprite (per flame) plus camera, particles, and texture updates. Consolidate and prioritize.

### 10b. Delta-Based Animation

**Technique**: Always use the `delta` parameter in `useFrame` for time-based animation, not `clock.elapsedTime` for position changes. This ensures animation speed is consistent regardless of frame rate.

```tsx
// Bad: frame-rate dependent
position.x += 0.01

// Good: frame-rate independent
position.x += delta * speed
```

Our `useCameraAnimation.ts` already uses `delta` for lerp operations — good. Our `Particles.tsx` uses `state.clock.elapsedTime` for sine waves (which is correct for oscillation) but `speeds[i] * 0.012 * (frameSkip + 1)` for fall speed (should use delta instead).

- **Applies to**: Particles.tsx fall speed

### 10c. Consolidate Multiple useFrame Callbacks

**Technique**: Each `useFrame` callback adds overhead to the frame loop. Instead of N callbacks, combine them into a single callback. Our 4 RedFlameSprite instances each add their own `useFrame`.

**Alternative**: Move flame animation to a single parent component with one `useFrame` that updates all flames:

```tsx
function RedSpirits({ positions, active }) {
  const groupRef = useRef<THREE.Group>(null)
  const spritesRef = useRef<THREE.Sprite[]>([])
  const lightsRef = useRef<THREE.PointLight[]>([])
  
  useFrame((state) => {
    if (!active) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < positions.length; i++) {
      // update sprites[i] and lights[i] directly
    }
  })
}
```

- **Applies to**: RedFlameSprite's 4+ separate useFrame callbacks. Consolidate into one useFrame in the parent RedSpirits component.

### 10d. Avoid Allocations in useFrame

**Technique**: Never allocate objects (`new Vector3()`, `new Matrix4()`, array literals, etc.) inside `useFrame`. Pre-allocate scratch objects in `useMemo` or `useRef`.

Our `useCameraAnimation.ts` already does this correctly with `scratchVecA`, `scratchVecB`, `scratchVecC` refs. ✅

But `Particles.tsx` creates a new `seededRandom()` inside the useFrame callback on every respawn:
```typescript
const rng = seededRandom(Math.floor((t + i) * 1000)) // Called per particle per frame on reset
```

This should be pre-computed or use a lightweight inline hash instead.

- **Applies to**: Particles.tsx seededRandom allocation in hot path

---

## Summary: Priority Action Items Mapped to Our Issues

| Issue | Root Cause | Fix | Priority |
|---|---|---|---|
| ScrollOverlay re-renders 60x/sec | `useSyncExternalStore` on raw scroll progress | Throttle DOM updates to ~10-15fps; use ref-based progress in Canvas components | **P0** |
| App & HeroOverlay unnecessary re-renders | `useScrollProgress()` in App.tsx triggers full tree re-render | Split scroll state: ref for Canvas, throttled store for DOM; memo overlay components | **P0** |
| HouseModel 2D canvas work per frame | `texture.needsUpdate = true` on 512x512 textures every frame | Replace with shader-based rendering; throttle to 15-20fps as intermediate | **P0** |
| Particles CPU-side position updates | `needsUpdate` on position buffer every frame | Move to vertex shader animation (like BlueSpirits pattern already in codebase) | **P1** |
| 4 separate useFrame for RedFlameSprite | Per-instance useFrame callbacks + pointLight per flame | Consolidate into single useFrame; consider InstancedMesh for sprites | **P1** |
| Projection matrix blending per frame | Already optimized with scratch refs | Verify no allocations; consider caching blend result if progress hasn't changed | **P2** |
| CSS origin updates | DOM writes every ~80ms from useFrame | Already throttled to ~12fps — acceptable, could go to ~5fps | **P2** |

### Additional Low-Effort Wins

| Technique | Effort | Impact |
|---|---|---|
| `<AdaptiveDpr pixelated />` in Canvas | Minimal | DPR reduces on scroll, restores when idle |
| `<AdaptiveEvents />` | Minimal | Disables raycasting during scroll |
| `<PerformanceMonitor>` + quality tier switching | Low | Dynamic quality on low-end devices |
| `startTransition` for DOM state updates | Low | Non-blocking DOM updates |
| `React.memo` on section components | Low | Prevents cascade re-renders |
| Particle fall speed: use `delta` not fixed multiplier | Minimal | Frame-rate independent animation |
| Move `seededRandom()` out of per-frame hot path | Minimal | Avoids allocation in useFrame |