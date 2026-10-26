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

Completed executions become abstract transitions when their source and resulting observations are available. With action rules, executions sharing endpoint states and the same abstract action share a transition; its `abstractAction` refers to that action. An execution that cannot be matched keeps a separate transition. Without action rules, endpoint states and the exact recorded action type determine grouping. Every supporting execution remains available.

Failed, incomplete, and otherwise unconnected executions retain their reported status and explanation. A separate observation-order link can connect consecutive observations in one test sequence when a completed execution does not connect them. It establishes order, without inventing an action or becoming an abstract transition.

Model construction and grouping are deterministic for the same evidence and rules, independent of the order in which sources are supplied. The preview records the rules, interpreter version, input fingerprints, and selected run references.

## Match available actions and executions

An optional `actions` section applies within each abstract source state. It selects operation normalization, action-description properties, target-widget properties, and input parameters. Equal selected values produce one abstract action. The [language reference](language.md#match-actions) explains how to select them.

`model.actionEvidence` contains abstract actions, unmatched available actions, and unmatched executions with reasons. Each action retains its comparison values, source state, availability records with their reported scope, and executions with their original status. References include source and run identities; availability also identifies the observation, action description, and bound widget.

A `recorded` relationship means an execution uses the same observation, action description, and target widget as a reported available action. That link is retained even if selected input values differ. The execution then belongs to the abstract action described by its actual values, with a diagnostic explaining the difference. If the execution cannot be compared, it stays unmatched and keeps its recorded availability references. An `abstraction` relationship means the action was placed using the selected comparison values, without that recorded availability link. Executions can also establish an action that no observation reported as available.

When two distinct available actions in one observation have the same comparison values, the abstract action is marked `ambiguous`. Recorded execution links remain usable. Other executions that would match that group stay unmatched and retain its ID in `possibleActionIds`. Identical repeated availability records count once.

An action with no supporting execution means no execution was matched in the selected evidence. A failed or unfinished attempt retains its status and does not become a completed transition. An availability record from one source does not prove that another source discovered the action or checked its properties. Oracle results remain attached to their original records.

## Processing

The implementation has no dependency on a dashboard, browser control, or an execution strategy. It uses standard URL, text encoding, and Web Crypto APIs available in the [supported environments](../README.md). It reads no files and makes no network requests.

The interpreter bounds rules to 64 KiB, selected observations to 10,000, selected widgets to 100,000, hierarchy depth to 128, normalized values to 1 MiB, and accumulated comparison data to 32 MiB per state or action processing pass. Action comparison accepts at most 100,000 availability and execution records combined. Exceeding an input or processing limit produces an error; an observation or action with unsuitable comparison values remains unmatched with a reason.

A caller can run computation in a worker and cancel by terminating that worker. Rendering, layout, selection highlighting, evidence-file import, and action execution belong to consumers.

## Verification

Core tests exercise normalization, property selection, widget filtering and hierarchy, capture distinctions, scoped identities, provenance, processing limits, and transition support. Shared conformance cases compare generic input records and rules with expected memberships and relationships. See [conformance](../conformance/README.md).

## Compatibility

Supported evidence and rule-language versions, interpreter identity, and release preparation are documented in [compatibility and releases](versioning.md).
