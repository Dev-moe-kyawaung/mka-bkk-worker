export type ScreenKind = 'dashboard' | 'chat' | 'map' | 'list' | 'checkout' | 'scan';

export interface ProjectScreen {
  kind: ScreenKind;
  title: string;
  subtitle: string;
  chips: string[];
  bars?: number[];
  rows?: { label: string; meta: string; value?: string }[];
  bubbles?: { me: boolean; text: string }[];
  pins?: { x: number; y: number; label: string }[];
}

export interface Project {
  id: string;
  name: string;
  client: string;
  year: string;
  role: string;
  duration: string;
  team: string;
  category: 'Fintech' | 'Health' | 'Logistics' | 'Social' | 'Retail' | 'Identity';
  tagline: string;
  accent: string;
  platforms: string[];
  stack: string[];
  screen: ProjectScreen;
  problem: string;
  approach: string[];
  snippet: { lang: string; caption: string; code: string };
  results: string[];
  highlights: string[];
  mermaid: string;
}

export const projects: Project[] = [
  {
    id: 'kestrel',
    name: 'Kestrel Bank',
    client: 'Kestrel',
    year: '2024 — 26',
    role: 'Principal Mobile Engineer',
    duration: '22 months',
    team: '9 engineers, 3 squads',
    category: 'Fintech',
    tagline: 'A 340-screen neobank rewritten on Kotlin Multiplatform without a feature freeze.',
    accent: '#A97BFF',
    platforms: ['Android', 'iOS', 'Shared KMP core'],
    stack: ['Kotlin 2.0', 'KMP', 'Compose Multiplatform', 'SQLDelight', 'Ktor', 'Hilt'],
    screen: {
      kind: 'dashboard',
      title: 'Total balance',
      subtitle: 'EUR · 4 accounts',
      chips: ['Send', 'Request', 'Cards'],
      bars: [42, 61, 38, 74, 55, 88, 66, 92, 71, 84, 63, 79],
      rows: [
        { label: 'Spotify', meta: 'Subscriptions', value: '−10.99' },
        { label: 'Salary', meta: 'Inbound', value: '+4,820.00' },
        { label: 'Deutsche Bahn', meta: 'Travel', value: '−38.40' },
      ],
    },
    problem:
      'Two native apps had drifted into near-parity-by-coincidence. Every payment feature shipped twice, bug-for-bug, and release trains left the platform 6 to 8 weeks apart.',
    approach: [
      'Froze new feature work for one quarter and moved the domain layer to a pure Kotlin module consumed by both apps.',
      'Kept UI native where it earns its keep: Compose Multiplatform for shared flows, SwiftUI for iOS-only surfaces.',
      'Made the module graph the architecture: a Gradle verification task fails the build on any inward-pointing dependency.',
      'Replaced a bespoke sync layer with SQLDelight plus a single conflict-policy object per aggregate.',
    ],
    snippet: {
      lang: 'kotlin',
      caption: 'Domain use case — platform-free, unit tested in under 40ms',
      code: `class TransferMoney(\n    private val repo: AccountRepository,\n    private val fraud: FraudPolicy,\n    private val clock: Clock,\n) {\n    suspend operator fun invoke(cmd: TransferCommand): Outcome<Receipt> =\n        fraud.check(cmd).flatMap {\n            repo.withAccount(cmd.from) { account ->\n                account debit cmd.amount\n                repo.enqueue(cmd, at = clock.now())\n                Outcome.ok(account.receiptFor(cmd))\n            }\n        }\n}`,
    },
    results: [
      'Cold start cut 41% by deferring non-critical graph nodes behind a startup budget.',
      '92% of business logic now shared; both stores ship on the same day.',
      'Crash-free sessions moved from 96.1% to 99.4% within two release trains.',
      'Time-to-first-feature for new hires dropped from 3 weeks to 5 days.',
    ],
    highlights: ['KMP migration', '92% shared code', 'Same-day store releases'],
    mermaid: `graph TD\n  UI[Compose Multiplatform UI] --> CT[Controllers]\n  CT --> UC[Use Cases]\n  UC --> RI[AccountRepository]\n  RI --> DB[SQLDelight Store]\n  RI --> API[Ktor Client]\n  UC --> FP[Fraud Policy]\n  FP --> RISK[Risk Engine]\n`,
  },
  {
    id: 'lumen',
    name: 'Lumen Health',
    client: 'Lumen',
    year: '2021 — 24',
    role: 'Staff Mobile Engineer',
    duration: '3 years',
    team: '12 engineers, 4 squads',
    category: 'Health',
    tagline: 'Offline-first clinical companion used at the bedside with no reliable network.',
    accent: '#5EE7FF',
    platforms: ['Android', 'iOS'],
    stack: ['Flutter 3.x', 'Dart isolates', 'Drift', 'Health Connect', 'FHIR'],
    screen: {
      kind: 'list',
      title: 'Ward 4B',
      subtitle: '18 patients · synced 2m ago',
      chips: ['Vitals', 'Meds', 'Notes'],
      rows: [
        { label: 'A. Fischer', meta: 'Room 12 · Stable', value: '98%' },
        { label: 'M. Okonjo', meta: 'Room 14 · Watch', value: '91%' },
        { label: 'L. Bianchi', meta: 'Room 15 · Stable', value: '97%' },
        { label: 'S. Novak', meta: 'Room 16 · Review', value: '88%' },
        { label: 'R. Haddad', meta: 'Room 18 · Stable', value: '99%' },
      ],
    },
    problem:
      'Ward devices lose connectivity constantly. The old app silently dropped charting writes, and clinicians stopped trusting it within a month of rollout.',
    approach: [
      'Every write lands in a local Drift store first and is acknowledged before the network is touched.',
      'A sync queue replays writes with idempotency keys, so a retry can never duplicate a medication entry.',
      'FHIR resources are parsed off the main isolate using a shared Rust core over Dart FFI.',
      'Offline state is a first-class part of the UI, not an error banner: queues, conflicts, and last-sync are visible.',
    ],
    snippet: {
      lang: 'dart',
      caption: 'Write-ahead queue — the network is an optimization, not a dependency',
      code: `Future<void> recordVitals(Vitals v) async {\n  final local = await store.insert(v.copyWith(status: Status.pending));\n  emit(state.copyWith(lastSync: Sync.queued(count: queue.length)));\n  try {\n    await api.push(v);\n    await store.markSynced(local.id);\n  } on ConflictException catch (e) {\n    await queue.defer(local.id, policy: ConflictPolicy.clinicianWins);\n  }\n}`,
    },
    results: [
      'Charting write-loss went from a daily complaint to zero incidents in 18 months.',
      'Median time to record vitals dropped from 74s to 21s at the bedside.',
      'Peak ward load of 12k charting events per hour held without frame drops.',
      'Adopted by 46 sites and cleared two clinical safety audits.',
    ],
    highlights: ['Offline-first', 'Zero data loss', '46 clinical sites'],
    mermaid: `graph TD\n  UI[Flutter Screens] --> BL[Bloc Controllers]\n  BL --> UC[Chart Use Cases]\n  UC --> WQ[Write-Ahead Queue]\n  WQ --> DR[Drift Store]\n  WQ --> NET[FHIR API]\n  WQ --> RS[Rust Parser FFI]\n`,
  },
  {
    id: 'atlas',
    name: 'Atlas Fleet',
    client: 'Atlas Logistics',
    year: '2019 — 21',
    role: 'Senior Android Engineer',
    duration: '2 years',
    team: '6 engineers',
    category: 'Logistics',
    tagline: 'Routing client for 12,000 drivers, running on devices that predate the app.',
    accent: '#FFC46B',
    platforms: ['Android', 'Rugged handhelds'],
    stack: ['Kotlin', 'WorkManager', 'Mapbox', 'Room', 'gRPC'],
    screen: {
      kind: 'map',
      title: 'Route 27 · 14 stops',
      subtitle: 'ETA 16:42 · 82 km left',
      chips: ['Navigate', 'Proof', 'Break'],
      pins: [
        { x: 0.22, y: 0.3, label: 'A' },
        { x: 0.58, y: 0.44, label: 'B' },
        { x: 0.38, y: 0.62, label: 'C' },
        { x: 0.72, y: 0.72, label: 'D' },
        { x: 0.5, y: 0.2, label: 'E' },
      ],
      rows: [{ label: 'Next stop', meta: 'Hafenstraße 14', value: '12 min' }],
    },
    problem:
      'Rugged handhelds with 2GB of RAM, and a route engine that had to keep working through tunnels with no signal for hours.',
    approach: [
      'Prefetched the whole route graph into Room on dispatch, so navigation is a local computation.',
      'Moved photo proof-of-delivery through a retrying upload worker with exponential backoff and dedupe.',
      'Killed a 1,400ms cold start by moving DI graph construction off the critical path with Baseline Profiles.',
      'Built a replay harness that replays a day of real telemetry against any candidate build.',
    ],
    snippet: {
      lang: 'kotlin',
      caption: 'Prefetch on dispatch — the tunnel is the normal case, not the edge case',
      code: `val prefetchRoute =\n    workManager.enqueueUniqueWork(\n        "route-$routeId",\n        ExistingWorkPolicy.KEEP,\n        prefetchRequest(routeId) // downloads tiles + stop graph\n    )\n\n// Navigation never waits on the network.\nval route = graphStore.routeFor(routeId) ?: queueOffline(routeId)`,
    },
    results: [
      'Cold start 1,410ms to 290ms on the fleet median device.',
      'Failed deliveries from lost connectivity fell 63%.',
      'Photo proof upload success rose from 84% to 99.1%.',
      'Battery draw per shift down 22% after killing a polling service.',
    ],
    highlights: ['12k drivers', 'Offline routing', '1.4s → 0.29s start'],
    mermaid: `graph TD\n  UI[Driver Screens] --> VM[RouteViewModel]\n  VM --> RT[RouteStore]\n  VM --> GPS[LocationPort]\n  RT --> RM[Room Graph]\n  RT --> PF[Prefetch Worker]\n  PF --> GRPC[gRPC Route API]\n  PF --> IMG[Tile Cache]\n`,
  },
  {
    id: 'nimbus',
    name: 'Nimbus Chat',
    client: 'Nimbus',
    year: '2018 — 21',
    role: 'Senior Android Engineer',
    duration: '3 years',
    team: '8 engineers',
    category: 'Social',
    tagline: 'Realtime messaging that survives 4M daily users and a 40k message burst per minute.',
    accent: '#FF77C4',
    platforms: ['Android', 'iOS'],
    stack: ['Kotlin', 'Coroutines', 'WebRTC', 'Protobuf', 'SQLDelight'],
    screen: {
      kind: 'chat',
      title: 'Release train',
      subtitle: '12 participants · typing…',
      chips: ['Thread', 'Call', 'Search'],
      bubbles: [
        { me: false, text: 'Shipped the FFI parser to staging' },
        { me: true, text: 'Frame time on the 2019 device?' },
        { me: false, text: '9.1ms p95. Under budget.' },
        { me: true, text: 'Then it goes out Thursday.' },
      ],
    },
    problem:
      'Message ordering was derived from device clocks, so group chats in bad networks showed messages from the future and silently hid later ones.',
    approach: [
      'Replaced clock ordering with a Lamport-style hybrid logical clock assigned at the edge.',
      'Rendered message lists from a paging source with diffable identities, so reorders never replay animations.',
      'Moved emoji and link entity parsing off the UI isolate into a shared worker.',
      'Gave every realtime socket a supervised retry scope so a dropped connection never leaks coroutines.',
    ],
    snippet: {
      lang: 'kotlin',
      caption: 'Hybrid logical clock — ordering is a server truth, not a device opinion',
      code: `override suspend fun onMessage(raw: ByteArray) {\n    val incoming = Envelope.parseFrom(raw)\n    val stamped = clock.observe(incoming.ts, incoming.node)\n    store.upsert(incoming.copy(orderedAt = stamped))\n    notifications.dedupe(incoming.id) // replay-safe\n}`,
    },
    results: [
      'Out-of-order message reports dropped to zero across 4M DAU.',
      'Message list jank p95 under 6ms with 5,000-message threads.',
      'Voice call setup time cut from 4.2s to 1.6s.',
      'Socket reconnect success rose from 71% to 97% on flaky networks.',
    ],
    highlights: ['4M DAU', 'WebRTC calls', 'Deterministic ordering'],
    mermaid: `graph TD\n  UI[Chat UI] --> PG[Pager + Reducer]\n  PG --> ST[Message Store]\n  ST --> HLC[Hybrid Logical Clock]\n  ST --> SOCK[Socket Supervisor]\n  SOCK --> PB[Protobuf Edge]\n  ST --> RTC[WebRTC Session]\n`,
  },
  {
    id: 'orbit',
    name: 'Orbit Pay',
    client: 'Orbit Retail',
    year: '2022 — 23',
    role: 'Mobile Architect (contract)',
    duration: '11 months',
    team: '5 engineers',
    category: 'Retail',
    tagline: 'Tap-to-pay POS for pop-up stores with no fixed terminal and no IT staff.',
    accent: '#5AF2A1',
    platforms: ['Android', 'iOS'],
    stack: ['Flutter', 'Dart FFI', 'Secure Element', 'Stripe_terminal'],
    screen: {
      kind: 'checkout',
      title: 'Espresso · 2 items',
      subtitle: 'Table 6 · open tab',
      chips: ['Tap', 'Split', 'Refund'],
      rows: [
        { label: '2 × Cortado', meta: 'Bar', value: '7.40' },
        { label: '1 × Almond croissant', meta: 'Bakery', value: '3.80' },
        { label: 'Service', meta: '12%', value: '1.34' },
      ],
      bars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    problem:
      'Staff ran the till on a spreadsheet app. Card capture needed a terminal in hand, so queues at pop-up events ran past twenty minutes.',
    approach: [
      'Captured card taps through the platform secure element behind a narrow FFI boundary shared by both apps.',
      'Made the receipt an append-only event log, so a refund is a new event and never a mutation.',
      'Built a paper-trail test suite that replays a full trading day through the ledger and diffs totals.',
      'Designed for one hand in a loud room: big targets, haptics as confirmation, no typing at the till.',
    ],
    snippet: {
      lang: 'dart',
      caption: 'Append-only ledger — refunds are events, never edits',
      code: `Ledger apply(Event e) => switch (e) {\n  Sale(:final id, :final cents) =>\n    copy(total: total + cents, lines: [...lines, e]),\n  Refund(:final saleId, :final cents) =>\n    copy(total: total - cents, lines: [...lines, e]),\n};`,
    },
    results: [
      'Average checkout time 78s down to 19s.',
      'Manual reconciliation work eliminated for 340 pop-up events.',
      'Payment capture success 97.2% to 99.6% on poor connectivity.',
      'Staff training reduced from a half day to a 12-minute walkthrough.',
    ],
    highlights: ['Tap-to-pay', 'Event-sourced ledger', '78s → 19s checkout'],
    mermaid: `graph TD\n  UI[Checkout UI] --> CO[Cart Controller]\n  CO --> LG[Ledger]\n  LG --> PAY[Payment Port]\n  PAY --> SE[Secure Element FFI]\n  LG --> REC[Receipt Renderer]\n`,
  },
  {
    id: 'verity',
    name: 'Verity ID',
    client: 'Verity',
    year: '2025 — 26',
    role: 'Principal Mobile Engineer',
    duration: '14 months',
    team: '7 engineers',
    category: 'Identity',
    tagline: 'Document and biometric verification that runs on-device, with the camera as the whole UI.',
    accent: '#4E9BFF',
    platforms: ['Android', 'iOS'],
    stack: ['Kotlin', 'CameraX', 'Rust core', 'TFLite', 'Pigeon'],
    screen: {
      kind: 'scan',
      title: 'Verify identity',
      subtitle: 'Document + liveness',
      chips: ['Scan', 'Selfie', 'Result'],
      rows: [
        { label: 'Document', meta: 'MRZ parsed on device', value: 'OK' },
        { label: 'Liveness', meta: '3 frames analysed', value: 'OK' },
        { label: 'Risk score', meta: 'Threshold 0.18', value: '0.04' },
      ],
      pins: [{ x: 0.5, y: 0.46, label: '◎' }],
    },
    problem:
      'Uploading ID photos to a cloud verifier was slow, expensive, and blocked entry in markets where upload bandwidth is the scarce resource.',
    approach: [
      'Shipped the MRZ parser and face-match model as a Rust core compiled to both platforms over FFI.',
      'Streamed camera frames into a bounded channel so a slow model can never back-pressure the camera.',
      'Kept every raw image on device: only signed assertions leave the phone.',
      'Added an on-device liveness model with a hard frame budget and graceful degradation on old GPUs.',
    ],
    snippet: {
      lang: 'kotlin',
      caption: 'Bounded frame channel — the model never back-pressures the camera',
      code: `private val frames = Channel<Frame>(capacity = 2, onBufferOverflow = DROP_OLDEST)\n\nCameraX.setImageAnalysis(\n    analyzer,\n    backpressure = STRATEGY_KEEP_ONLY_LATEST,\n) { frame -> frames.trySend(frame) }\n\nscope.launch {\n    for (frame in frames) {\n        val verdict = nativeCore.verify(frame)\n        if (verdict.confident) complete(verdict)\n    }\n}`,
    },
    results: [
      'Verification completed in 3.1s median on a 2021 mid-range device.',
      'Zero raw biometric images transmitted — attestations only.',
      'Pass rate lifted from 71% to 89% in low-bandwidth markets.',
      'Core parser shared verbatim between Android and iOS builds.',
    ],
    highlights: ['On-device ML', 'Rust FFI core', '71% → 89% pass rate'],
    mermaid: `graph TD\n  CAM[CameraX / AVFoundation] --> CH[Bounded Channel]\n  CH --> RS[Rust Core]\n  RS --> MRZ[MRZ Parser]\n  RS --> FM[Face Match]\n  RS --> LV[Liveness Model]\n  RS --> AT[Signed Attestation]\n  AT --> API[Verify API]\n`,
  },
];

export const projectCategories = [
  'All',
  'Fintech',
  'Health',
  'Logistics',
  'Social',
  'Retail',
  'Identity',
] as const;

export const getProject = (id: string) => projects.find((p) => p.id === id);
