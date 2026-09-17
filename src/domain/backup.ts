import type { AttemptEvent } from './attempt'
import type { ReviewEvent } from './review'

export const BACKUP_FORMAT = 'c1-trainer-backup' as const
export const BACKUP_FORMAT_VERSION = '1.0.0' as const

export interface BackupMetadata {
  databaseVersion: number
}

export interface BackupEnvelopeV1 {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_FORMAT_VERSION
  exportedAt: string
  app: BackupMetadata
  attemptEvents: AttemptEvent[]
  reviewEvents: ReviewEvent[]
}
