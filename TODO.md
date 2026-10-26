# Remaining work

- [x] Extract the rule interpreter, presets, evidence indexing, and abstract model construction into an independent package.
- [x] Provide generic input contracts and shared abstraction conformance cases.
- [x] Prepare GitHub-tag installation and document the shared `0.3.x` versioning convention.
- [ ] Make the GitHub repository public and create the first release tag, `v0.3.0`.
- [ ] Switch the dashboard dependency to `github:ferpasri/testar-abstraction#v0.3.0` and regenerate its lockfile once the tag is accessible.
- [ ] Add independently configurable action-abstraction rules beyond the current exact action-type grouping.
- [ ] Extend conformance cases for additional language operations and invalid inputs.
- [ ] Add incremental model updates for newly recorded observations and executions.
- [ ] Measure memory and processing limits on larger evidence collections.
- [ ] Provide model queries required by exploration strategies, retaining uncertainty about capture and reporting limits.
- [ ] Define a portable abstract-model exchange format when consumers need to exchange constructed models.
