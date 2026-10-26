# Abstraction examples

These policies illustrate caller choices. The [language reference](language.md) defines the operations and fields. Property keys must match the captured evidence.

## Page addresses and titles

This policy compares addresses and titles while explicitly removing selected session data:

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

For comparison, `https://example.test/account;jsessionid=abc?session=temporary&mode=summary#top` becomes `https://example.test/account?mode=summary`. The original address remains in the evidence. Parameter names are application-specific and case-sensitive.

## Include or exclude widgets

Add this section to a definition to compare roles and names while excluding a changing clock and its descendants:

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

The policy compares the retained widget descriptions without using their order. Duplicate descriptions still count separately.

## Match actions

This fragment explicitly groups `tap` and `click` operations when their captured target role and name agree:

```json
"actions": {
    "type": [{"op": "map", "values": {"tap": "click"}}],
    "target": [
        {"name": "role", "keys": ["ui.role"], "required": true},
        {"name": "name", "keys": ["ui.name"], "required": true}
    ]
}
```

If one trace reports A1 through A5, another observation executes A4, and another source executes A5, matching state and action values can produce five abstract actions. A4 and A5 retain their execution support; A1 through A3 have no matched execution in that evidence. See the [shared action cases](../conformance/README.md#action-cases).

To compare planned input with actual execution parameters, place this fragment inside `actions`:

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

Here the action-description properties contain `{"planned_input": {"amount": 100}}` and the execution parameters contain `{"amount": 100}`. Both field lists project the name `amount`.

## Captured styles and result text

Add fields like these to `widgets.fields`, using the actual property keys recorded by the source:

```json
{"name": "display", "keys": ["source.style.display"]},
{"name": "visibility", "keys": ["source.style.visibility"]},
{"name": "text", "keys": ["ui.text"], "transforms": [{"op": "trim"}, {"op": "collapse_whitespace"}]}
```

A child can report `visibility: "visible"` while its parent has `display: "none"`. Comparing the parent's display setting can distinguish a form from its result panel. Result text can distinguish `Denied` from `Approved`; other changing text, such as dates or amounts, also participates when selected. The [loan visibility cases](../conformance/README.md#loan-visibility-example) apply three policies to identical evidence.
