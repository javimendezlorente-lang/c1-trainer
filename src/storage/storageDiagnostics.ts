import { ATTEMPT_DATABASE_NAME, attemptRepository } from './attemptRepository'

export interface StorageStatus { available: boolean; databaseName: string; reason?: string }

export async function checkStorage(): Promise<StorageStatus> {
  if (typeof indexedDB === 'undefined') return { available: false, databaseName: ATTEMPT_DATABASE_NAME, reason: 'This browser does not provide IndexedDB.' }
  try {
    await attemptRepository.db.open()
    return { available: true, databaseName: ATTEMPT_DATABASE_NAME }
  } catch (error) {
    return { available: false, databaseName: ATTEMPT_DATABASE_NAME, reason: error instanceof Error ? error.message : 'IndexedDB could not be opened.' }
  }
}
