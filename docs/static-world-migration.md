# Static World Migration — export contract

Goal: replace the three separate baked models (environment, decor, computer)
with **one static glb** containing the room, desk and monitor shell, plus a
**named anchor** that drives the monitor screen placement — eliminating the
hardcoded transform in `src/Application/World/MonitorScreen.ts` and the `900`
runtime scale in `src/Application/Utils/BakedModel.ts`.

Status: **waiting for the asset.** No code changes land until the glb exists.

## What the glb must contain

1. **Single static mesh set**: environment + decor + desk + monitor shell,
   sharing **one baked texture**.
   - CoffeeSteam stays separate (it is animated / shader-driven).
   - The screen itself is NOT modeled — it stays code-built (live `<iframe>`
     via CSS3DRenderer). Only its *placement* comes from the anchor below.

2. **Transforms applied / exported at final scale.**
   - Runtime scale becomes `1`. Author so 1 export unit == 1 world unit at the
     scale the scene already uses (the old meshes were multiplied by 900, so
     the new glb should be ~900x larger than the raw source meshes were).
   - This is what makes anchor coordinates share one space with the geometry.

3. **Screen anchor** — a Blender Empty:
   - Name **exactly** `ScreenAnchor` (case-sensitive; code finds it by name).
   - Positioned at the **center of the screen surface**.
   - Oriented so local **+Z points out of the screen** (toward the viewer),
     **+Y up**, **+X to the viewer's right**. Code reads `getWorldPosition()`
     and `getWorldQuaternion()` from it.
   - Screen opening sized **1280 x 1024 export units** to match `SCREEN_SIZE`
     in `MonitorScreen.ts`. If you can't hit that exactly, tell me the real
     dimensions and I'll derive a screen scale from the anchor instead.

4. **Draco** (optional): the decoder already lives at `static/draco/gltf/`.
   If you export with Draco compression I'll wire up `DRACOLoader`
   (currently `Resources.ts` uses a plain `GLTFLoader`).

## Suggested file layout

- Model:   `static/models/World/static_world.glb`
- Texture: `static/models/World/baked_static.jpg` (sRGB; recommend 4K — one
  atlas for the whole room means more resolution pressure)

## Code changes I'll make once the asset lands

- Collapse the three `sources.ts` entries into one model + one texture.
- Replace `Environment`/`Decor`/`Computer` with a single static-world loader,
  runtime scale `1`.
- `MonitorScreen`: read `ScreenAnchor` world position/rotation instead of the
  `(0, 950, 255)` / `-3°` constants, with a fallback to the old constant if the
  anchor is missing (so the scene still runs mid-migration).
- Add `DRACOLoader` if the glb is Draco-compressed.
