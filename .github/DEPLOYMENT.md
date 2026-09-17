# C1 Trainer deployment

C1 Trainer is a browser-first static application. The GitHub Actions workflow builds and tests it, then deploys the production bundle to GitHub Pages when a version tag is pushed.

## Local commands

```bash
npm install
npm test -- --run
npm run lint
npm run typecheck
npm run validate:content -- content/approved
npm run build
npm run verify:pwa
```

The production output is written to `dist/`.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml`:

1. runs tests, lint, TypeScript checks, and approved-content validation on pushes and pull requests targeting `master`;
2. builds the production bundle after the test job succeeds;
3. deploys the build only for pushes to `master`.

The current Vite base path is `/c1-trainer/`, matching the intended repository URL shape `https://USERNAME.github.io/c1-trainer/`. If the repository name changes, update `base`, the manifest `start_url`/`scope`, and the Pages configuration together. Hash routing keeps client-side navigation compatible with static hosting.

The production build generates `manifest.webmanifest`, `sw.js`, `registerSW.js`, and Workbox support chunks under `dist/`. The service worker uses `generateSW` and precaches only the current shell assets; no broad runtime or cross-origin caching is configured.

## iPhone installation

Open the deployed HTTPS URL in Safari, choose **Share → Add to Home Screen**, and launch C1 Trainer from the Home Screen. There is intentionally no custom install button. Updates use automatic service-worker behavior for this shell; revisit that policy before adding long-lived unsaved activities such as Writing tasks.

## Scope and attribution

This deployment contains only the independent C1 Trainer shell and project-owned material. It is not affiliated with or endorsed by Cambridge English. Third-party foundation attribution is recorded in [`LICENSES/THIRD-PARTY.md`](../LICENSES/THIRD-PARTY.md).
