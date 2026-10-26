# Abstraction language

Rules choose which captured state and widget properties distinguish observations. The language version is `1`. Presets and custom JSON rules use the same interpreter.

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
