# Abstraction conformance cases

Each case contains three files:

| File            | Meaning                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `input.json`    | Generic reconstructed evidence records and the selected test runs. Maps are represented as arrays so any language can read them.           |
| `rules.json`    | The abstraction rules applied to that evidence.                                                                                            |
| `expected.json` | The expected observation groups, transition support, order links, unmatched observations, unlinked executions, and widget correspondences. |

These inputs describe records after an evidence reader has reconstructed a trace. They are separate from the original JSONL evidence-format conformance cases in `testar-evidence-specs`.

To run a case, turn each record array into a map keyed by its ID (`execution.id` for execution records), apply the rules to the selected runs, and compare the result with `expected.json`. Array order is ignored. Expected memberships use original-record references rather than implementation-generated group IDs or display labels.

| Case                  | Behavior                                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `normalized-pages`    | Merge pages after explicit session-data removal and title normalization; retain execution support from both sources. |
| `filtered-widgets`    | Exclude a changing widget while retaining correspondence between stable widgets.                                     |
| `unmatched-and-order` | Retain a missing-title observation, failed/incomplete executions, and distinct observation-order links.              |
| `capture-same`        | Keep different reported capture statuses separate.                                                                   |
| `capture-ignore`      | Group the same observations when the rules explicitly ignore capture status.                                         |

`npm test` runs all cases. The tests also reverse source order and check that the supplied records were preserved. These cases belong to this repository and can be reused by other implementations of the abstraction language.
