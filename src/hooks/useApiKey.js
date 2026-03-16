import { useState, useCallback } from 'react'

const API_KEY_STORAGE = 'dogspeak_key'

function readStoredKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || ''
  } catch {
    return ''
  }
}

export function useApiKey() {
  const [apiKey, setApiKey] = useState(readStoredKey)
  const [saved, setSaved] = useState(() => !!readStoredKey())

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
