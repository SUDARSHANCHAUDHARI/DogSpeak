import type { TranslationResult } from './utils/api'
import type { Severity } from './utils/constants'

export type { Severity, TranslationResult }

export interface HistoryEntry {
  headline: string
  severity: Severity
  audienceKey: string
  time: string
  parsed: TranslationResult
  input: string
}
