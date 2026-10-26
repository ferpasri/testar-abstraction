# Abstraction language

Rules choose which captured state and widget properties distinguish observations and, optionally, which captured action details distinguish actions. The language version is `1`. Presets and custom JSON rules use the same interpreter.

## A small JSON language

The definition identifies its language version, gives the policy a name, and selects the comparison fields. Session data can make the same page address differ between runs. This example explicitly removes a named path parameter and query parameter while still comparing page titles:

```json
{
    "version": 1,
    "name": "Page address and title without session data",
    "state": [
        {
            "name": "address",
            "keys": ["ui.url"],
            "required": true,
            "transforms": [
                {
                    "op": "url",
                    "remove_path_parameters": ["jsessionid"],
                    "remove_query": ["session"],
                    "remove_fragment": true
                }
            ]
        },
        {
            "name": "title",
            "keys": ["ui.title"],
            "required": true,
            "transforms": [{ "op": "trim" }, { "op": "collapse_whitespace" }]
        }
    ],
    "capture": "same"
}
```

For comparison, `https://example.test/account;jsessionid=abc?session=temporary&mode=summary#top` becomes `https://example.test/account?mode=summary`. The full captured address remains in the original evidence.

Choose parameter names according to the application. Removing a parameter can combine observations that it previously distinguished. Names are exact and case-sensitive: `jsessionid` does not match `JSESSIONID` or `jsessionid_123`. The rule removes every named semicolon parameter from every path segment, including parameters without a value. Unrelated parameters keep their order and encoding.

Parameter names are percent-decoded once for comparison. Encoded semicolons are not treated as separators, and malformed encoded names remain unchanged. Query parameters and fragments change only when their separate options request it.

A field's `keys` are alternative property names, checked in order. The first property present in the captured record supplies its value. This allows a policy to read different names used by different producers. The `name` identifies that field in the comparison explanation.

Transforms normalize string values before comparison. Available operations trim text, collapse whitespace, convert text to lowercase, replace literal text, map chosen strings to common descriptions, and remove selected path parameters, query parameters, or fragments from absolute URLs. Replacement applies to every occurrence; an unmapped string keeps its original value. Values are compared exactly after normalization.

## Include or exclude widgets

Add a `widgets` section to compare widget descriptions. For example:

```json
"widgets": {
    "fields": [
        {"name": "role", "keys": ["ui.role"]},
        {"name": "label", "keys": ["ui.name", "ui.title"]}
    ],
    "exclude": [
        {"keys": ["ui.name", "ui.title"], "op": "equals", "value": "Current time"}
    ],
    "hierarchy": "flat",
    "order": "sort",
    "descendants": "exclude"
}
```

This fragment compares roles and labels, excludes a clock widget and its descendants, and ignores the order of the remaining descriptions. Two identical buttons still count twice.

Exclusion rules inspect the original property values. A widget is excluded when any rule matches. Rules can test whether a property is present, equals a JSON value, or contains selected text.

With `descendants: "keep"`, descendants of an excluded widget remain and attach to their nearest retained ancestor. `hierarchy: "tree"` compares those parent-child relationships; `"flat"` compares a collection of descriptions. `order: "preserve"` keeps captured order, while `"sort"` normalizes it.

Matching widget descriptions does not establish that the widgets are the same instance. A group can contain several widgets with the same description, and every original reference remains available. Widgets with no captured values for the selected fields do not receive correspondence links.

## Missing information and capture limits

A missing property differs from an explicit JSON `null`. A required field that is missing prevents that observation from joining an observation group and produces an explanation. An unsuitable value for a string transform also produces a diagnostic. An observation without usable comparison values is kept separate.

`capture: "same"` includes the recorded capture status in comparison. It distinguishes complete, filtered, and unavailable captures. Producers can have different capture scopes even when both report complete; users must check those scopes before interpreting a match. `"ignore"` deliberately leaves the status out of comparison.

When a policy compares widgets and the widget capture is unavailable, the observation remains separate. Known exclusions and normalization choices are part of the policy, rather than evidence that missing data was captured.

## Identity and processing

A preview retains the full rules, interpreter version, source fingerprints, selected runs, and original-record references. Oracle results keep their original targets; grouping observations does not extend oracle coverage to other observations.

`parseAbstractionRules()` validates rule syntax and processing bounds. `previewAbstraction()` applies those rules to the selected reconstructed evidence. See the [specification](SPEC.md) and [conformance cases](../conformance/README.md) for the input and expected output contracts.

## Match actions

Add an `actions` section to match actions within each abstract state. For example, this distinguishes buttons by their captured role and name, while explicitly treating `tap` and `click` as the same operation:

```json
"actions": {
    "type": [{"op": "map", "values": {"tap": "click"}}],
    "target": [
        {"name": "role", "keys": ["ui.role"], "required": true},
        {"name": "name", "keys": ["ui.name"], "required": true}
    ]
}
```

`type` transforms the recorded `action_type`. `target` reads properties of the widget bound to that available action or execution, in its source observation. `description` optionally selects fields from the action description's properties. The selected values, together with the normalized operation, identify an abstract action within its abstract source state. Recorded IDs remain references, rather than being compared across tools.

An absent target widget, missing required field, unsuitable transform, or an entire selected field list with no captured values leaves that action unmatched with a reason. Missing optional fields remain different from captured values, including JSON null. A rule with an empty `actions` object deliberately compares only the operation. Omitting `actions` keeps the existing transition grouping and produces no `actionEvidence` collection.

To distinguish input values, select where the planned value appears in the action description and where the executed value appears in execution parameters:

```json
"parameters": {
    "available": [
        {"name": "amount", "keys": ["planned_input"], "path": ["amount"], "required": true}
    ],
    "executed": [
        {"name": "amount", "keys": ["amount"], "required": true}
    ]
}
```

Place this fragment inside `actions`. Both lists must use the same field names; their property keys can differ. `path` optionally reads nested keys after selecting the first present property. In this example, the available action's properties contain `{"planned_input": {"amount": 100}}`, while the execution parameters contain `{"amount": 100}`. No parameter mapping is inferred from a tool's name. When `parameters` is omitted, input values do not distinguish abstract actions.

Suppose one trace reports A1 through A5, another observation later executes A4, and a second source executes A5. If the selected states and action values match, the abstract state has five abstract actions. A4 and A5 retain their supporting executions; A1, A2, and A3 have no matched execution in that evidence. The original availability records still show which source reported each action. Matching is a choice made by these rules, rather than proof that the actions have identical effects.

The result preserves explicit action links separately from inferred matches and identifies ambiguous matches. See the [specification](SPEC.md#match-available-actions-and-executions) for those relationships.
