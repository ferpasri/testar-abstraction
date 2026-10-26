# Remaining work

- [x] Extract the rule interpreter, presets, evidence indexing, and abstract model construction into an independent package.
- [x] Provide generic input contracts and shared abstraction conformance cases.
- [x] Prepare GitHub-tag installation and document the shared `0.3.x` versioning convention.
- [x] Make the GitHub repository public and create the first release tag, `v0.3.0`.
- [x] Switch the dashboard dependency to `github:ferpasri/testar-abstraction#v0.3.0` and regenerate its lockfile.
- [x] Add optional action rules for operation, target properties, action-description properties, and selected parameters.
- [x] Aggregate reported available actions and execution support across traces, retaining recorded links, inferred matches, and ambiguity.
- [x] Add shared action conformance cases, including available actions without recorded executions.
- [ ] Publish `v0.3.1`, then update consumers to use the new GitHub tag.
- [ ] Add dashboard rendering of abstract actions and outcomes that have not been observed, using the retained supporting records.
- [ ] Extend conformance cases for additional language operations and invalid inputs.
- [ ] Add incremental model updates for newly recorded observations and executions.
- [ ] Measure memory and processing limits on larger evidence collections.
- [ ] Provide model queries required by exploration strategies, retaining uncertainty about capture and reporting limits.
- [ ] Define a portable abstract-model exchange format when consumers need to exchange constructed models.
