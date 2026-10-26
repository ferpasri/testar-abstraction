# Compatibility and releases

The package version is recorded in [package.json](../package.json) and its lockfile. GitHub release tags identify published source. Released tags remain unchanged.

## Compatibility identifiers

| Identifier          | Meaning and source                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package version     | The software release selected by a consumer. The first two numbers follow the TESTAR Evidence compatibility family; the patch advances independently.                 |
| Evidence schema     | This implementation accepts reconstructed records from evidence schema `3`, as defined by [TESTAR Evidence specs](https://github.com/ferpasri/testar-evidence-specs). |
| Rule language       | Definitions use language version `1`; the parser validates that value.                                                                                                |
| Interpreter version | `INTERPRETER_VERSION` in [src/types.ts](../src/types.ts) identifies interpretation behavior and is included in previews.                                              |

A package release can add documentation, cases, fixes, or optional rule features while retaining the evidence schema and rule-language version. Changes to existing rule meanings require an explicit compatibility decision. Pre-release tags let consumers test source before a final release.

## Prepare a release

```sh
npm run check
npm run build
npm pack --dry-run
```

Set the package version and matching lockfile entry, commit and push the verified source, then create a matching GitHub tag. Consumers install the selected tag using the [README instructions](../README.md#install-a-github-release). npm runs `prepare` to build JavaScript and declarations from that source.
