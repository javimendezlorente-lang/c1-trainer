# Backup and restore

Settings provides local **Export backup**, **Import backup**, and **Reset learning data** actions. Export uses a normal browser download named `c1-trainer-backup-YYYY-MM-DD.json`; import uses the standard file picker and works without a network connection. Safari/iOS may present the downloaded file through its normal share/save flow rather than a desktop-style download shelf.

Import is merge-only. Selecting a file first parses and validates the complete envelope and every historical event, then shows a preview. The user must confirm before any write. Identical event IDs/idempotency keys are skipped; a matching event ID or key with a different immutable payload aborts the import and never overwrites history.

The commit writes AttemptEvents and ReviewEvents in one IndexedDB transaction. A storage failure rolls the transaction back. After a successful commit, the app rebuilds Error Bank, practice Progress, skill profile, ReviewCards, due state, and review metrics from the ledgers; backup projection data is neither accepted nor trusted because it is not present in the format.

Backups remain local until the user chooses to share the file. They can contain selected answers, correct answers, timestamps, exercise IDs, and memory-review history. The app does not upload backups and has no account or credential data in the envelope.
