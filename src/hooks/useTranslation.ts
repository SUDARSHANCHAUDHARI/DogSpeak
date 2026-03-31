import { useState, useCallback, useRef } from 'react'
import { translateDatadog } from '../utils/api'
import { AUDIENCE_OPTIONS } from '../utils/constants'
import type { HistoryEntry } from '../types'
import type { Provider } from './useApiKey'

const HISTORY_KEY = 'dogspeak_history'
const MAX_HISTORY = 10
const EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

function loadHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (!saved) return []
    const all = JSON.parse(saved) as HistoryEntry[]
    const cutoff = Date.now() - EXPIRY_MS
    return all.filter(e => !e.savedAt || e.savedAt > cutoff)
  } catch {
    return []
  }
}

function saveHistory(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // ignore storage errors
  }
}

export function useTranslation() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<HistoryEntry['parsed'] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [streamingTokens, setStreamingTokens] = useState(0)
  const abortRef = useRef<AbortController | null>(null)

  const translate = useCallback(async (
    input: string,
    audienceKey: string,
    apiKey: string,
    providerOptions?: { provider?: Provider; model?: string; baseUrl?: string },
  ) => {
    if (!input.trim()) return

    const audienceOption = AUDIENCE_OPTIONS.find((a) => a.key === audienceKey)
    if (!audienceOption) return

    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)
    setResult(null)
    setStreamingTokens(0)

    try {
      const parsed = await translateDatadog(
        input,
        audienceOption.prompt,
        apiKey,
        (accumulated) => setStreamingTokens(accumulated.length),
        { ...providerOptions, signal: controller.signal, audienceSchema: audienceOption.schema },
      )
      setResult(parsed)
      setStreamingTokens(0)

      const newEntry: HistoryEntry = {
        headline: parsed.headline,
        severity: parsed.severity,
        audienceKey,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsed,
        input,
        savedAt: Date.now(),
      }

      setHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, MAX_HISTORY)
        saveHistory(updated)
        return updated
      })
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return // cancelled — no error shown
      if (err instanceof Error && err.name === 'TimeoutError') {
        setError('Request timed out after 45 seconds. Please try again.')
        return
      }
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFromHistory = useCallback((entry: HistoryEntry): string => {
    setResult(entry.parsed)
    setError(null)
    return entry.input
  }, [])

  const clearResult = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    try { localStorage.removeItem(HISTORY_KEY) } catch {}
  }, [])

  return { loading, result, error, history, streamingTokens, translate, loadFromHistory, clearResult, clearHistory }
}
