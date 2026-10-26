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

## Action cases

`action-cases/` uses the same input and rules files. Its expected result describes abstract actions, availability references and scopes, execution references and statuses, recorded versus inferred relationships, ambiguity, and transition support. Source-state memberships replace generated state IDs. Diagnostics are checked for presence; generated abstract-action IDs and wording are not part of the portable expected result.

| Case                        | Behavior                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `available-and-executed`    | Report A1 through A5, then link A4 from a later observation and A5 from another source, with different recorded IDs and an explicitly normalized operation. |
| `ambiguous-targets`         | Retain a recorded link to one of two identical button descriptions; leave a cross-source execution unmatched.                                               |
| `missing-targets`           | Keep available actions and executions with missing target information visible as unmatched records.                                                         |
| `selected-parameters`       | Match a chosen planned input value against an executed input value.                                                                                         |
| `recorded-input-difference` | Retain a recorded selection link while grouping the execution by its actual input values, with a diagnostic.                                                |
| `execution-statuses`        | Preserve completed, failed, incomplete, and awaiting-result statuses; only a completed execution supports a transition.                                     |
| `actions-scoped-by-state`   | Keep the same action description separate when it belongs to different abstract states.                                                                     |

The action tests also reverse sources, selected runs, and every input map, and verify that original records remain unchanged.
