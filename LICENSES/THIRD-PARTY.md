# Third-party attribution record

This file records third-party material present in the current C1 Trainer foundation and is the required ledger for future reuse.

## Current foundation

### `dhanak/examiner`

- Source: <https://github.com/dhanak/examiner>
- Foundation commit: `df862f7fcc8f82271bfc53f54396a86c599eb861`
- License: MIT
- License text: [`EXAMINER-MIT.txt`](EXAMINER-MIT.txt)
- Imported material: React/Vite shell, routing, theme, test infrastructure, configuration, and GitHub Pages workflow. The generic exercise components were audited during the baseline and removed from the current product shell.
- Modification status: adapted into C1 Trainer; no Cambridge exercise content has been copied from this repository.
- Attribution: retain the MIT copyright and permission notice for copied or adapted portions. This project is not affiliated with David Hanak or the original project.

Before the first reuse, record for each source:

- repository URL;
- exact commit or package version;
- files or dependency used;
- license name and license text location;
- modifications made;
- attribution location in the product;
- whether the source is code, documentation, data, or a reference-only observation.

Current audited sources and decisions are documented in [`docs/research/LICENSING.md`](../docs/research/LICENSING.md) and [`docs/research/REUSE_MATRIX.md`](../docs/research/REUSE_MATRIX.md).

### `vite-plugin-pwa` and Workbox

- Package: `vite-plugin-pwa` `1.3.0` (MIT)
- Source: <https://github.com/vite-pwa/vite-plugin-pwa>
- Use: Vite integration with the `generateSW` strategy for manifest generation, service-worker generation, and shell precaching.
- Modification status: configuration only; no custom service worker is shipped.
- Transitive Workbox packages are brought in by the plugin and remain build-time dependencies. Their generated service worker is not hand-edited.

### Workbox

- Package family: Workbox `7.4.1` (MIT), brought in transitively by `vite-plugin-pwa`.
- Source: <https://github.com/GoogleChrome/workbox>
- Use: generated precaching and navigation fallback for the current application shell only.
- Modification status: generated output only; no Workbox source is copied or modified.

### `ts-fsrs`

- Package: `ts-fsrs` `5.4.2`
- Source: <https://github.com/open-spaced-repetition/ts-fsrs>
- License: MIT (package metadata and distributed license)
- Node requirement: `>=20.0.0`
- Use: browser-side FSRS scheduling for deliberate Error Bank review sessions, isolated behind `src/learning/fsrs/fsrsAdapter.ts`.
- Modification status: package is used as published; the optional optimizer/binding package is not installed.
- Purpose: calculate and preview Again/Hard/Good/Easy scheduling outcomes. It does not grade exercises or replace the append-only AttemptEvent/ReviewEvent history.
