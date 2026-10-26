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

The package is distributed from versioned Git tags in the public GitHub repository. Replace `RELEASE_TAG` with the tag selected from the [published releases](https://github.com/ferpasri/testar-abstraction/releases):

```sh
npm install github:ferpasri/testar-abstraction#RELEASE_TAG
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

The result contains abstract states, transitions supported by recorded executions, original-record references, unmatched observations, and executions without a connected result. Observation-order links remain separately identified. Optional action rules also match available actions and executions by operation, target properties, and selected parameters. The result distinguishes recorded action links from matches inferred through those rules. See the [action rules](docs/language.md#match-actions).

Original evidence is retained. Abstraction rules choose the distinctions that matter for a testing objective. An exploration strategy decides which action to execute next and belongs to its consuming application.

- [Specification](docs/SPEC.md)
- [Abstraction language](docs/language.md)
- [Worked examples](docs/examples.md)
- [Conformance cases](conformance/README.md)
- [Remaining work](TODO.md)

## Compatibility and releases

See [compatibility and release preparation](docs/versioning.md) for the version identifiers, supported evidence schema, and release checks. The package version and build requirements are recorded in [package.json](package.json).
