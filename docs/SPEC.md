# Abstraction specification

## Inputs

A caller supplies reconstructed evidence sources, selected test runs, and abstraction rules. The caller's evidence reader validates the original evidence format and execution lifecycle before supplying those records.

Each source has an ID, display label, and fingerprint identifying its content. Record IDs are scoped by source and by run or observation where appropriate. Two unrelated sources can use the same record IDs without connecting their evidence.

`EvidenceInput` supplies five maps: `runs`, `sequences`, `observations`, `actions`, and `executions`. Observations retain recorded states, widgets, capture status, available actions, and artifact references. Execution records retain their reported status and resulting-observation reference. The package reads these maps without modifying them.

## Group observations

`previewAbstraction()` validates the rules, indexes the selected evidence, and compares the chosen state and widget properties. It returns observation groups, comparison explanations, widget correspondences, and reasons for unmatched observations. Progress is reported through an optional callback.

Normalization affects comparison values. Original properties and captured URLs remain in the source records. Missing properties, JSON null, and unsuitable transform inputs keep distinct meanings. Capture status participates when `capture` is `same`.

Repeated widget descriptions retain their original references and ambiguity. A correspondence does not establish that two widgets are the same instance.

## Build an abstract model

`buildAbstractModel()` checks the preview's source fingerprints and selected runs, then builds nodes and edges. Every observation remains represented, including unmatched observations with explanations.

Completed executions become abstract transitions when their source and resulting observations are available. Executions sharing endpoint states and an exact action type share a transition, with each supporting execution retained. Parameters and targets remain available through those original executions.

Failed, incomplete, and otherwise unconnected executions retain their reported status and explanation. A separate observation-order link can connect consecutive observations in one test sequence when a completed execution does not connect them. It establishes order, without inventing an action or becoming an abstract transition.

Model construction and grouping are deterministic for the same evidence and rules, independent of the order in which sources are supplied. The preview records the rules, interpreter version, input fingerprints, and selected run references.

## Processing

The implementation has no dependency on a dashboard, browser control, or an execution strategy. It uses standard URL, text encoding, and Web Crypto APIs available in browsers and Node.js 24 and later. It reads no files and makes no network requests.

The interpreter bounds rules to 64 KiB, selected observations to 10,000, selected widgets to 100,000, hierarchy depth to 128, normalized values to 1 MiB, and accumulated comparison data to 32 MiB. Exceeding an input or processing limit produces an error; an observation with unsuitable comparison values remains unmatched with a reason.

A caller can run computation in a worker and cancel by terminating that worker. Rendering, layout, selection highlighting, evidence-file import, and action execution belong to consumers.

## Verification

Core tests exercise normalization, property selection, widget filtering and hierarchy, capture distinctions, scoped identities, provenance, processing limits, and transition support. Shared conformance cases compare generic input records and rules with expected memberships and relationships. See [conformance](../conformance/README.md).

## Releases and compatibility

The package starts at `0.3.0`, in the same `0.3` compatibility family as TESTAR Evidence specs. Project-specific compatible releases increment the last number independently. Release documentation identifies the supported evidence schema; the initial release supports schema `3`.

Consumers install a versioned GitHub dependency such as `github:ferpasri/testar-abstraction#v0.3.0` and import `testar-abstraction` by name. npm runs `prepare` to build the JavaScript and TypeScript declarations from the tagged source. The package also includes this specification, the language reference, and the conformance cases. Package versions, JSON language versions, and interpreter identifiers describe separate aspects of compatibility; see [versioning](../README.md#versioning).
