import { useState, useCallback } from 'react'
import { translateDatadog } from '../utils/api'
import { AUDIENCE_OPTIONS } from '../utils/constants'

const HISTORY_KEY = 'dogspeak_history'
const MAX_HISTORY = 10

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch {
    // ignore storage errors
  }
}

export function useTranslation() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState(loadHistory)
  const [streamingTokens, setStreamingTokens] = useState(0)

  const translate = useCallback(async (input, audienceKey, apiKey) => {
    if (!input.trim()) return

    const audienceOption = AUDIENCE_OPTIONS.find((a) => a.key === audienceKey)
    if (!audienceOption) return

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
      )
      setResult(parsed)
      setStreamingTokens(0)

      const newEntry = {
        headline: parsed.headline,
        severity: parsed.severity,
        audienceKey,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parsed,
        input,
      }

      setHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, MAX_HISTORY)
        saveHistory(updated)
        return updated
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFromHistory = useCallback((entry) => {
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
