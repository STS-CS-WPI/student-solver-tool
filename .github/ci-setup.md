# CI and GHCR setup

The [CI workflow](./workflows/ci.yml) runs on pull requests and pushes to `main`, in this order:

1. `check` runs lint, formatting, type checks, and unit tests.
2. `e2e` runs Cypress against the development server and a temporary SQLite database.
3. `docker` builds the `runner` and `migrator` images in parallel after both earlier jobs pass.

Pull requests build both images without publishing. Successful pushes to `main` publish:

```text
ghcr.io/sts-cs-wpi/student-solver-tool:runner-<full-commit-sha>
ghcr.io/sts-cs-wpi/student-solver-tool:migrator-<full-commit-sha>
```

Publishing uses `GITHUB_TOKEN` with `packages: write`; no additional registry secret is required. If an existing package rejects publishing, grant this repository **Write** access under **Package settings → Manage Actions access**. See [GitHub's package access guide](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility#ensuring-workflow-access-to-your-package).

GHCR packages default to private, even for public repositories. To allow anonymous pulls, after the first image publication a package administrator must open **STS-CS-WPI > Packages > student-solver-tool > Package settings** and set visibility to **Public**. This one-time setting covers both `runner-*` and `migrator-*` tags.

Docker layers use GitHub Actions caching with separate `runner` and `migrator` scopes.

CI prepares its database with `prisma db push`, so it does not execute committed migration SQL.

## Releases

The [release workflow](./workflows/release.yml) runs when a GitHub release is published, including prereleases. It adds version tags to the release commit's existing CI images. For example, `v2.1.0` adds:

```text
ghcr.io/sts-cs-wpi/student-solver-tool:runner-v2.1.0
ghcr.io/sts-cs-wpi/student-solver-tool:migrator-v2.1.0
```

1. Choose a `main` commit whose CI workflow has succeeded, including both Docker jobs.
2. Publish a GitHub release targeting that commit with a version tag such as `v2.1.0`. Generate release notes in GitHub or with `gh release create --generate-notes`.
3. Confirm **Release images** succeeds, then follow the [deployment instructions](../deploy/README.md).

If a source image is missing, rerun the release workflow after CI finishes. The workflow rejects existing version tags that point to different images.
