# Learning backup format

C1 Trainer backup files use the independent format version `1.0.0`:

```json
{
  "format": "c1-trainer-backup",
  "version": "1.0.0",
  "exportedAt": "2026-09-17T12:00:00.000Z",
  "app": { "databaseVersion": 3 },
  "attemptEvents": [],
  "reviewEvents": []
}
```

The envelope version is separate from exercise schema versions, AttemptEvent/ReviewEvent versions, and the IndexedDB schema version. It is currently compatible with `1.x.x`; unsupported major versions are rejected explicitly.

The file contains only historical AttemptEvents and ReviewEvents plus minimal metadata. Error Bank, Progress, skill profile, ReviewCards, due queues, cached statistics, exercise content, service-worker data, UI state, credentials, and passwords are never exported. Historical timestamps are copied exactly; only `exportedAt` describes the backup operation.
