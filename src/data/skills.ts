export type SkillCategory =
  | 'Languages'
  | 'Frameworks'
  | 'Architecture'
  | 'Platform'
  | 'Tooling'
  | 'Performance'
  | 'Leadership';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  /** 0 – 100 proficiency, drives the ring. */
  level: number;
  years: number;
  note: string;
  color: string;
}

export const skillCategories: { id: SkillCategory | 'All'; label: string; color: string }[] = [
  { id: 'All', label: 'All orbits', color: '#5EE7FF' },
  { id: 'Languages', label: 'Languages', color: '#5EE7FF' },
  { id: 'Frameworks', label: 'Frameworks', color: '#A97BFF' },
  { id: 'Architecture', label: 'Architecture', color: '#FF77C4' },
  { id: 'Platform', label: 'Platform', color: '#5AF2A1' },
  { id: 'Tooling', label: 'Tooling', color: '#FFC46B' },
  { id: 'Performance', label: 'Performance', color: '#4E9BFF' },
  { id: 'Leadership', label: 'Leadership', color: '#FF8A5B' },
];

export const skills: Skill[] = [
  { id: 'kotlin', name: 'Kotlin', category: 'Languages', level: 96, years: 8, note: 'Coroutines, Flow, inline value classes, K2.', color: '#A97BFF' },
  { id: 'dart', name: 'Dart', category: 'Languages', level: 95, years: 7, note: 'Isolates, FFI, code-gen, const-heavy widget trees.', color: '#5EE7FF' },
  { id: 'swift', name: 'Swift', category: 'Languages', level: 78, years: 4, note: 'Enough to review PRs and own platform bridges.', color: '#FF8A5B' },
  { id: 'typescript', name: 'TypeScript', category: 'Languages', level: 74, years: 3, note: 'Internal tooling, dashboards, this very portfolio.', color: '#4E9BFF' },
  { id: 'sql', name: 'SQL / Room / Drift', category: 'Languages', level: 90, years: 7, note: 'Query plans, migrations, and indexes that matter.', color: '#5AF2A1' },
  { id: 'rust', name: 'Rust (FFI)', category: 'Languages', level: 58, years: 2, note: 'Shared crypto and parsing cores over Dart/Kotlin FFI.', color: '#FFC46B' },

  { id: 'flutter', name: 'Flutter', category: 'Frameworks', level: 97, years: 7, note: 'Custom render objects, shaders, engine contributions.', color: '#5EE7FF' },
  { id: 'compose', name: 'Jetpack Compose', category: 'Frameworks', level: 93, years: 5, note: 'Composition locals, recomposition budgets, macro libs.', color: '#A97BFF' },
  { id: 'kmp', name: 'Kotlin Multiplatform', category: 'Frameworks', level: 92, years: 4, note: 'expect/actual boundaries, shared KMM domain modules.', color: '#FF77C4' },
  { id: 'coroutines', name: 'Coroutines + Flow', category: 'Frameworks', level: 94, years: 6, note: 'Structured concurrency, cancellation discipline.', color: '#5AF2A1' },
  { id: 'swiftui', name: 'SwiftUI', category: 'Frameworks', level: 76, years: 3, note: 'Feature parity surfaces for shared designs.', color: '#FF8A5B' },
  { id: 'rn', name: 'React Native', category: 'Frameworks', level: 71, years: 2, note: 'Bridge audits and new-architecture migrations.', color: '#4E9BFF' },

  { id: 'clean', name: 'Clean Architecture', category: 'Architecture', level: 95, years: 8, note: 'Dependency rule enforced by module graph linting.', color: '#FF77C4' },
  { id: 'mvi', name: 'MVI / MVVM', category: 'Architecture', level: 94, years: 6, note: 'Unidirectional state, single source of truth, testable reducers.', color: '#A97BFF' },
  { id: 'modular', name: 'Modular Monolith', category: 'Architecture', level: 91, years: 5, note: 'Feature modules with explicit public API surfaces.', color: '#5EE7FF' },
  { id: 'di', name: 'Hilt / Koin / get_it', category: 'Architecture', level: 92, years: 6, note: 'Scoped graphs, replaceable test containers.', color: '#5AF2A1' },
  { id: 'offline', name: 'Offline-first sync', category: 'Architecture', level: 89, years: 6, note: 'CRDT-lite queues, conflict policy as code.', color: '#FFC46B' },

  { id: 'android', name: 'Android SDK', category: 'Platform', level: 95, years: 9, note: 'Background limits, lifecycle, per-app language prefs.', color: '#5AF2A1' },
  { id: 'channels', name: 'Platform channels', category: 'Platform', level: 93, years: 7, note: 'Pigeon, event channels, JNI edge cases.', color: '#A97BFF' },
  { id: 'bg', name: 'WorkManager / BG tasks', category: 'Platform', level: 89, years: 6, note: 'Constraints, expedited jobs, OEM battery quirks.', color: '#FF8A5B' },
  { id: 'a11y', name: 'Accessibility', category: 'Platform', level: 86, years: 5, note: 'Semantics trees, dynamic type, TalkBack journeys.', color: '#4E9BFF' },
  { id: 'ios', name: 'iOS integration', category: 'Platform', level: 74, years: 4, note: 'Capabilities, signing, App Store review rails.', color: '#FF77C4' },

  { id: 'gradle', name: 'Gradle', category: 'Tooling', level: 94, years: 8, note: 'Configuration cache, build cache, convention plugins.', color: '#FFC46B' },
  { id: 'ci', name: 'CI / CD', category: 'Tooling', level: 91, years: 7, note: 'GitHub Actions matrices, flaky-test quarantine.', color: '#5EE7FF' },
  { id: 'fastlane', name: 'Fastlane', category: 'Tooling', level: 86, years: 6, note: 'Dual-store release trains with signed artifacts.', color: '#A97BFF' },
  { id: 'observability', name: 'Sentry / Datadog RUM', category: 'Tooling', level: 88, years: 5, note: 'Release health gates in the pipeline.', color: '#FF77C4' },
  { id: 'firebase', name: 'Firebase', category: 'Tooling', level: 87, years: 7, note: 'Config, remote flags, Crashlytics triage loops.', color: '#5AF2A1' },

  { id: 'startup', name: 'Startup time', category: 'Performance', level: 92, years: 6, note: 'Baseline profiles, lazy DI, measured first frame.', color: '#4E9BFF' },
  { id: 'jank', name: 'Jank profiling', category: 'Performance', level: 93, years: 6, note: 'Frame timeline triage down to the shader.', color: '#5EE7FF' },
  { id: 'memory', name: 'Memory profiling', category: 'Performance', level: 89, years: 7, note: 'Leak canaries, bitmap pools, retained contexts.', color: '#A97BFF' },
  { id: 'binary', name: 'Binary size', category: 'Performance', level: 85, years: 5, note: 'R8 rules, tree-shaken fonts, asset budgets in CI.', color: '#FFC46B' },

  { id: 'reviews', name: 'Design review', category: 'Leadership', level: 91, years: 6, note: 'RFC templates that end in decisions, not threads.', color: '#FF8A5B' },
  { id: 'mentoring', name: 'Mentoring', category: 'Leadership', level: 92, years: 6, note: '18 engineers mentored, 6 promoted.', color: '#FF77C4' },
  { id: 'rfc', name: 'Technical writing', category: 'Leadership', level: 88, years: 6, note: 'ADRs, migration plans, incident postmortems.', color: '#A97BFF' },
  { id: 'ownership', name: 'Release ownership', category: 'Leadership', level: 93, years: 7, note: 'Rollout trains, staged percentages, clean rollbacks.', color: '#5AF2A1' },
];
