export interface ArchModule {
  name: string;
  detail: string;
}

export interface ArchLayer {
  id: string;
  order: number;
  name: string;
  short: string;
  tech: string;
  color: string;
  rule: string;
  modules: ArchModule[];
}

export const archLayers: ArchLayer[] = [
  {
    id: 'presentation',
    order: 0,
    name: 'Presentation',
    short: 'UI',
    tech: 'Flutter Widgets · Compose · SwiftUI',
    color: '#5EE7FF',
    rule: 'Dumb, subscribable, no business rules. Renders state and emits intents.',
    modules: [
      { name: ':feature:transfer', detail: 'Composable screens, controllers, and intent reducers.' },
      { name: ':feature:home', detail: 'Dashboard shells and widget catalogs shared by both apps.' },
      { name: ':designsystem', detail: 'Tokens, motion curves, and theming shared across surfaces.' },
    ],
  },
  {
    id: 'domain',
    order: 1,
    name: 'Domain',
    short: 'CORE',
    tech: 'Pure Kotlin / Dart — zero Android or Flutter imports',
    color: '#A97BFF',
    rule: 'The only layer allowed to change for business reasons. Fully unit tested.',
    modules: [
      { name: ':core:domain', detail: 'Use cases, entities, policy objects, and result types.' },
      { name: ':core:analytics-api', detail: 'Event contracts with typed payloads, no SDK leakage.' },
      { name: ':core:common', detail: 'Clocks, id generators, and dispatchers as injectable ports.' },
    ],
  },
  {
    id: 'data',
    order: 2,
    name: 'Data',
    short: 'IO',
    tech: 'Retrofit · Ktor · SQLDelift · Room · DataStore',
    color: '#FF77C4',
    rule: 'Repository implementations decide cache strategy and conflict policy.',
    modules: [
      { name: ':core:data', detail: 'Repository impls, mappers, and offline-first sync queues.' },
      { name: ':core:network', detail: 'Typed API surfaces, interceptors, retry and circuit breaking.' },
      { name: ':core:database', detail: 'Versioned schemas, migrations tested in CI on real data.' },
    ],
  },
  {
    id: 'platform',
    order: 3,
    name: 'Platform',
    short: 'SHELL',
    tech: 'expect/actual · Pigeon · Dart FFI · native plugins',
    color: '#5AF2A1',
    rule: 'The seam. Shared contracts with platform-specific actuals behind them.',
    modules: [
      { name: ':platform:bridge', detail: 'Pigeon-generated channels, versioned and code-reviewed.' },
      { name: ':platform:secure', detail: 'Keystore / Keychain wrappers with biometric unlock policy.' },
      { name: ':platform:telemetry', detail: 'One analytics pipeline, pluggable backends per build type.' },
    ],
  },
];

export const archPrinciples = [
  {
    title: 'Dependency rule',
    body: 'Arrows only point inward. A lint task walks the Gradle module graph and fails CI when :core:domain gains an Android dependency.',
  },
  {
    title: 'Modular by feature, layered by default',
    body: 'Features are vertical slices; the four horizontal layers are the contract every slice implements.',
  },
  {
    title: 'Two UIs, one core',
    body: 'Flutter and native surfaces read the same domain module, so parity is structural rather than aspirational.',
  },
  {
    title: 'Measured, not vibed',
    body: 'Startup, jank, and binary size budgets live in CI. A regression blocks the release train.',
  },
];

export const archMermaid = `graph TD
  UI[Presentation Widgets] --> VM[Controllers + Reducers]
  VM --> UC[Use Cases]
  UC --> RI[Repository Interfaces]
  RI --> RM[Remote Sources]
  RI --> CA[Local Cache]
  RM --> BR[Platform Bridge]
  CA --> BR
  BR --> OS[Android / iOS APIs]
`;
