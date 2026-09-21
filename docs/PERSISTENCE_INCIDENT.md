# Persistence incident — Phase 8.5D

Status: code hardening complete; public/device reproduction pending  
Date opened: 2026-09-21

## Reported symptom

On the public GitHub Pages build, submitting a Part 1 exercise showed “The attempt could not be saved locally. Please try submitting again.” The report came from the deployed browser experience; it is not evidence that the event was lost, because the error was shown before Progress/Review could be checked.

## Baseline before D1 changes

- Git tree: clean.
- HEAD: `91aafa61c1c1d5e79776351299a2fdaaaa27d106` (`docs: record Phase 8.5C checkpoint`).
- Full Vitest suite: 31 files, 84 tests passed.
- ESLint: passed.
- TypeScript: passed.
- Approved content validation: 24 files valid.
- Production build and PWA verification: passed; 7 precache entries.

The clean local baseline means the incident was not reproduced by the existing unit/build gates. The first reported reproduction used an in-app browser, an environment that can apply different storage or privacy policies from Safari and the installed PWA.

## Investigation boundary

The app is client-only by design. Attempt history must remain in IndexedDB, must survive a page reload/PWA update, and must never be cleared as part of service-worker installation. The repository has no production call to `deleteAttemptDatabase`; that function is test cleanup only.

The D1 hardening adds a real IndexedDB reopen regression test, explicit storage diagnostics, and a learner-facing failure message that distinguishes unavailable storage from a transient save failure. The public-browser/device test remains a required manual acceptance step.

## Root-cause status

**ROOT CAUSE NOT FULLY PROVEN.**

The available evidence narrows the incident but does not identify one definitive cause:

- The fresh IndexedDB v4 migration and reopen integration test pass, including a second repository instance reading the same AttemptEvent after reopening.
- The application has no production call to `deleteAttemptDatabase`; database deletion is confined to test cleanup.
- Production build, base-path asset loading and service-worker verification pass locally, and the service-worker update path does not clear the application database.
- The reported failure occurred in the deployed in-app browser, but the same public-origin failure has not been reproduced in a controlled desktop browser or on Safari/iPhone in this environment.

Database versioning, an origin/storage-policy difference in the in-app browser, a stale deployed build, and a deployment-cache mismatch therefore remain hypotheses rather than established causes. The hardening reduces the failure surface and improves diagnostics; it must not be described as proof that the original public incident is resolved until the manual public-origin checklist has passed.

## Production-like test boundary

The repository has automated fake-IndexedDB coverage and a production `vite preview` smoke check. A real browser automation runtime is not installed in this workspace, so the complete fresh-profile → submit → close/reopen → review → disposition → update-build sequence is recorded as pending rather than simulated. The exact executable sequence is in [`DEVICE_ACCEPTANCE.md`](DEVICE_ACCEPTANCE.md).

## Executed evidence

- Production build served at the GitHub Pages-style `/c1-trainer/` base: HTTP 200 for the app shell, manifest and service worker.
- Service worker output contains no database-delete operation.
- Automated fake-IndexedDB coverage passes the reopen regression, AttemptEvent/ReviewEvent replay, disposition filtering and backup round-trip.
- Fresh-profile interaction and real deployed-origin persistence remain pending because no browser automation or physical device was available for this run.

## Required acceptance evidence

1. Submit an exercise online in Safari and confirm Progress and Review update.
2. Close/reopen the PWA and confirm the same data remains.
3. Repeat once in Airplane Mode after the app shell has been opened online.
4. Export a JSON backup from Settings and verify it contains the saved history.

No OpenAI call, generation batch, Worker deployment, or runtime network dependency is part of this incident fix.
