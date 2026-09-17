# PWA acceptance test plan

This plan separates repeatable automated/build checks from manual browser and iPhone acceptance. The current milestone proves app-shell offline capability only. It does not make future exercise content available offline.

## Automated and production-build checks

Run from the repository root:

```bash
npm install
npm test -- --run
npm run lint
npm run typecheck
npm run validate:content -- content/approved
npm run build
npm run verify:pwa
```

Confirm that `dist/` contains:

- `manifest.webmanifest`;
- `sw.js` and the generated registration script;
- `assets/` JavaScript and CSS bundles;
- `icons/c1-trainer-192.png` and `icons/c1-trainer-512.png`.

`npm run verify:pwa` checks the generated manifest, base paths, icon sizes, registration path, service-worker output, absence of external URLs, and a small predictable precache list. Inspect `dist/manifest.webmanifest` and confirm `start_url` and `scope` are `/c1-trainer/`, `display` is `standalone`, language is `en`, and both PNG sizes are declared. Inspect `dist/sw.js` and its Workbox precache list; it should contain only the current shell build and small static assets, not future content or external URLs.

The unit suite covers manifest-adjacent configuration indirectly through production output checks, preserves the five shell routes, and keeps domain/content validation independent of React. It does not attempt to mock the complete service-worker lifecycle.

## Desktop production offline test

1. Run `npm run build`.
2. Run `npm run preview -- --host 127.0.0.1`.
3. Open `http://127.0.0.1:4173/c1-trainer/` online.
4. In browser DevTools → Application, confirm the manifest is detected and a service worker is installed and controlling the page.
5. Visit Home, Practice, Review, Progress, and Settings.
6. Switch the theme and confirm the shell remains usable.
7. Set the browser network condition to Offline.
8. Hard-refresh or close and reopen the production URL.
9. Confirm the shell starts and the five routes remain navigable offline.
10. At a viewport of approximately 390 px wide, confirm there is no horizontal overflow.
11. Confirm that no exercise corpus, grader, Error Bank, or learning-history feature is presented as available.

Restore the browser network condition and stop the preview server after the test. Development-server behavior is not authoritative for this test because Vite dev mode does not represent the generated production service worker.

## iPhone Safari manual acceptance

This is a real-device test and is not claimed as completed by automated tooling.

1. Open the deployed HTTPS URL in Safari.
2. Confirm the normal browser version loads.
3. Choose **Share → Add to Home Screen**.
4. Launch C1 Trainer from the Home Screen and confirm standalone presentation where supported.
5. Visit all five sections once.
6. Close the application.
7. Enable Airplane Mode or otherwise remove connectivity.
8. Relaunch C1 Trainer from the Home Screen.
9. Confirm the shell starts and navigation still works.
10. Confirm Settings and theme switching work.
11. Restore connectivity and confirm normal operation resumes.

Before adding long-lived unsaved activities such as Writing, revisit the automatic update behavior and decide whether an explicit update/recovery UX is needed.
