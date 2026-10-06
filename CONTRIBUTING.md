# Contributing

1. Use Node 22.19 or newer.
2. Run `npm ci`.
3. Optional: run `npm run hooks:install` to enable the tracked Git hooks. This replaces any existing `core.hooksPath` for the clone.
4. Run `npm run check` before opening a pull request. This includes the enforced 95% c8 line-coverage gate for every executable production TypeScript file (`index.ts` and `src/**/*.ts`). Do not add exclusions for executable code.
5. Do not commit prompt content, credentials, generated coverage, tarballs, or runtime state.

Coverage reports are generated under `coverage/` and are intentionally ignored. Use `npm run coverage` for the coverage-only gate; it writes text output and `coverage/lcov.info`.

## Commit messages

Use [Release Please Conventional Commits](https://github.com/googleapis/release-please#how-should-i-write-my-commits):

```text
type(scope)!: description
```

The scope and `!` are optional. Use `feat` for a minor release, `fix` for a patch release, and `deps` for a dependency release. Mark a breaking change with `!` in the pull request (PR) title for a major release. Squash is the only enabled merge strategy, and GitHub discards the squash commit body, so branch commit footers do not reach Release Please.

The optional local `commit-msg` hook keeps branch history consistent. Run `npm run hooks:install` once per clone to enable it; `--no-verify` bypasses it. The PR-title check is the release-format gate because GitHub uses the PR title as the final squash commit subject. After this workflow lands on `main`, repository rules must require `Validate Conventional Commit title`. The check appears on subsequent PRs, not on the PR that first adds the workflow.

Follow [RELEASING.md](RELEASING.md). Merge the Release Please PR to create the GitHub release and publish the package to npm with provenance.
