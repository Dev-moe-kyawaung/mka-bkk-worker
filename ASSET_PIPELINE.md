# Asset pipeline

Everything the scenes draw is generated at runtime or shipped as a static asset — there is no
network fetch on the critical path, so first paint never waits on a CDN.

## Pipeline stages

```
source asset            transform                      shipped artefact
─────────────────────   ─────────────────────────────  ────────────────────────────────
Android head / bird     SVG path + animated gradient   runtime <Svg> (iridescent sweep)
                         ↑ stands in for a custom GLSL fragment shader
app screenshots         typed ProjectScreen spec       runtime device UI per mockup
GLTF phone shell        BoxGeometry-equivalent Views   3D transform device frame
skills corpus           Fibonacci sphere projection    pooled particle views
contact stars           normalised 0–1 star map        SVG lines, drawn on scroll
resume                  markdown template generator    Blob download / native share
```

## Compression rules

| Asset class      | Treatment                                                            | Budget   |
| ---------------- | -------------------------------------------------------------------- | -------- |
| Vectors          | inline SVG paths, no rasterisation, no blur filters                  | 0 KB     |
| Icons            | one Ionicons font, imported directly (`@expo/vector-icons/Ionicons`) | —        |
| Raster / 3D      | none shipped; geometry is derived from layout units                  | —        |
| Static assets    | all hashed assets Expo emits (fonts + images)                        | 1200 KB  |
| JS               | single web bundle, gzip asserted in CI                               | 640 KB   |

Measured on the shipped build: **428 KB gzip JS**, **960 KB static assets**. Importing the
`@expo/vector-icons` barrel pulls in all fifteen icon fonts (8.1 MB) — always import the single
set you use.

## Swapping in real GLTF

The device shell in `src/components/PhoneMockup.tsx` is a stand-in for a GLTF model. To use a
real one:

1. Run the model through `gltf-pipeline -i phone.gltf -o phone.glb --draco.compress`.
2. Re-encode textures with `toktx --t2 --encode_basisu phone.ktx2 albedo.png`.
3. Drop the `.glb` / `.ktx2` into `assets/models/` and load with
   `useGLTF('assets/models/phone.glb')` + `useKTX2` inside a `<Suspense>` boundary.
4. Lazy-load the scene: `React.lazy(() => import('./scenes/Gallery'))`.

The rest of the scroll choreography does not change — the camera scrub in
`src/screens/HomeScreen.tsx` already drives every scene from a single shared value.

## Frame budget

`scripts/perf-budget.mjs` fails CI when weight budgets are breached, and documents the
33.3ms/frame floor the five scenes are designed against (60fps steady state).
