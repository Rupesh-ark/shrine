# shrine

A 3D immersive portfolio built as a scroll-driven cinematic experience. Navigate through a Japanese-inspired night scene, from outside a shrine, through the doors, and into a world of projects, skills, and stories.


## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Three.js** via **React Three Fiber** (R3F) + **Drei**
- **Postprocessing** (Bloom, Vignette)
- **GLTF / Draco** compressed 3D models
- Custom GLSL shaders for starfield, spirits, and atmosphere

## Architecture

```
src/
├── components/
│   ├── CanvasScene.tsx       # R3F Canvas setup, camera, tone mapping
│   ├── Scene.tsx             # Scene composition: lighting, ground, models
│   ├── SkyDome.tsx           # Procedural nebula + 12,000 GPU-animated stars
│   ├── Atmosphere.tsx        # Batched particle spirits (BlueSpirits via Points)
│   ├── HouseModel.tsx        # Shrine GLB, materials, shoji door animation
│   ├── PostProcessing.tsx    # EffectComposer: Bloom + Vignette + Noise
│   └── sections/             # HTML overlay sections (Hero, Projects, etc.)
├── hooks/
│   ├── useCameraAnimation.ts # Scroll-driven camera + ortho→perspective blend
│   └── useScrollProgress.ts  # Normalized scroll position [0, 1]
```

## Key Features

### Scroll-Driven Camera
The camera moves from an orthographic-like intro view through the shrine doors and into an interior focus — all driven by scroll position with smooth easing and breathing motion.

### Performance Optimizations
- DPR capped at `[1, 1.5]`
- Canvas texture updates throttled to ~15 FPS
- ContactShadows scaled and blurred for mobile
- Point lights reduced from 56 → ~6 via clustering and batching
- 3D models loaded with Draco compression

## Running Locally

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Models & Assets

- `house.glb` — Japanese shrine (Draco compressed)
- `table_with_cusions.glb` — Interior table set

## License

MIT
