# C1 Trainer deployment

C1 Trainer is a browser-first static application. The GitHub Actions workflow builds and tests it, then deploys the production bundle to GitHub Pages when a version tag is pushed.

## Local commands

```bash
npm install
npm test -- --run
npm run lint
npm run build
```

The production output is written to `dist/`.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml`:

1. runs tests and lint on pushes and pull requests targeting `master`;
2. builds the production bundle after the test job succeeds;
3. deploys the build only for a tag matching `v*`.

The Vite base path is currently inherited as `/examiner/` and must be changed to the final repository Pages path when the repository is connected to GitHub. Hash routing keeps client-side navigation compatible with static hosting.

## Scope and attribution

This deployment contains only the independent C1 Trainer shell and project-owned material. It is not affiliated with or endorsed by Cambridge English. Third-party foundation attribution is recorded in [`LICENSES/THIRD-PARTY.md`](../LICENSES/THIRD-PARTY.md).
