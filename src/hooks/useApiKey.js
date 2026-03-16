import { useState, useCallback } from 'react'

const API_KEY_STORAGE = 'dogspeak_key'

export function useApiKey() {
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE) || ''
    } catch {
      return ''
    }
  })

  const [saved, setSaved] = useState(!!localStorage.getItem(API_KEY_STORAGE))

  const saveKey = useCallback((key) => {
    try {
      localStorage.setItem(API_KEY_STORAGE, key)
      setApiKey(key)
      setSaved(true)
    } catch {
      // ignore
    }
  }, [])

  const clearKey = useCallback(() => {
    try {
      localStorage.removeItem(API_KEY_STORAGE)
      setApiKey('')
      setSaved(false)
    } catch {
      // ignore
    }
  }, [])

  return { apiKey, saved, setApiKey, saveKey, clearKey }
}
