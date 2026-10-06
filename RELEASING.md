# Releasing

Every push to `main` runs Release Please. It opens or updates a release pull request from [Conventional Commits](https://github.com/googleapis/release-please#how-should-i-write-my-commits). Use `feat` for a minor release, `fix` for a patch release, `deps` for a dependency release, and `!` in the PR title for a major release. GitHub uses the PR title as the squash commit subject and discards the commit body, so branch commit footers, `Release-As:`, and multi-entry release footers do not reach Release Please. Merging the release pull request creates the matching GitHub release.

The workflow publishes the released version only when npm does not already contain it. Rerunning after a registry failure is safe. Versions already present on npm are skipped. After a registry failure, rerun the failed Release workflow or push another commit to `main`; the `detect-publish` job retries the missing version.

Repository rules for `main` must require `Validate Conventional Commit title`. Enable this requirement after the title workflow first lands on `main`; the check starts with subsequent PRs.

The `npm` GitHub environment must remain enabled, and npm trusted publishing must authorize:

* Repository: `unrelentingfox/pi-view-system-prompt`
* Workflow: `release.yml`
* Environment: `npm`

Confirm each release in the GitHub Actions Release run and on npm.
