# TESTAR Abstraction

Apply explicit abstraction rules to recorded testing evidence and build an abstract model whose states and transitions retain links to their supporting records.

The package works in a browser, a Web Worker, or Node.js 24 and later. A dashboard can render its results; an exploration component can use them as input to an action-selection strategy.

## Build and test

```sh
npm install
npm run build
npm test
```

## Install a GitHub release

The package is distributed from versioned Git tags in the public GitHub repository. Use Node.js 24 or later and Git. Once tag `v0.3.0` is available, install it with:

```sh
npm install github:ferpasri/testar-abstraction#v0.3.0
```

The consumer's dependency is:

```json
"testar-abstraction": "github:ferpasri/testar-abstraction#v0.3.0"
```

npm downloads the tagged source, installs the build dependencies, and runs the package's `prepare` script to compile the JavaScript and TypeScript declarations. Consumers import `testar-abstraction` by name. Commit the consumer's `package-lock.json` to retain the resolved commit. Scripts must be enabled for the package build.

## Use the package

```typescript
import {
    parseAbstractionRules,
    previewAbstraction,
    buildAbstractModel,
    runKey,
    type AnalysisSource,
} from "testar-abstraction";

// Supply evidence already reconstructed and validated by your evidence reader.
async function construct(sources: AnalysisSource[], rulesJson: string) {
    const selectedRuns = sources.flatMap((source) =>
        [...source.evidence.runs.keys()].map((run) => runKey(source.id, run)),
    );
    const rules = parseAbstractionRules(rulesJson);
    const preview = await previewAbstraction(sources, rules, selectedRuns);
    return { preview, model: buildAbstractModel(preview, sources) };
}
```

`AnalysisSource` identifies an evidence source and supplies its fingerprint and reconstructed records. `EvidenceInput` contains maps of runs, sequences, observations, action descriptions, and action executions. Existing readers can supply a compatible object; no dashboard classes are required. Map keys are the corresponding record IDs, and execution keys are `execution.id`. Large indexes can use `bigint` in memory.

The result contains abstract states, transitions supported by recorded executions, original-record references, unmatched observations, and executions without a connected result. Observation-order links remain separately identified. Current transitions combine executions with the same endpoint states and exact action type.

Original evidence is retained. Abstraction rules choose the distinctions that matter for a testing objective. An exploration strategy decides which action to execute next and belongs to its consuming application.

- [Specification](docs/SPEC.md)
- [Abstraction language](docs/language.md)
- [Conformance cases](conformance/README.md)
- [Remaining work](TODO.md)

## Versioning

The first package release is `0.3.0`, aligned with the `0.3` compatibility family of [TESTAR Evidence specs](https://github.com/ferpasri/testar-evidence-specs/tree/v0.3.0). It consumes evidence schema `3` records.

The first two version numbers identify the shared compatibility family. The last number tracks this project's compatible releases independently: an abstraction fix can be published as `0.3.1` while the specs remain at `0.3.0`. Each release documents the evidence format it supports. Breaking API or rule-meaning changes require an explicit compatibility-family or language-version decision.

The JSON abstraction language is version `1`. The interpreter reports `1.1.0` to identify the interpretation behavior used to produce a result. Those identifiers have different purposes from the package version.

## Create a GitHub release

Verify the release from this repository:

```sh
npm run check
npm run build
npm pack --dry-run
```

Commit and push the verified source, then create a GitHub release with tag `v0.3.0` pointing to that commit. Keep released tags unchanged; publish later compatible changes under a new tag such as `v0.3.1` and set the matching version in `package.json`.

Consumers install the tagged source with the command above. They do not need a separate checkout of this repository or an npm-registry publication. The `prepare` script builds the distributed files during Git dependency installation.
