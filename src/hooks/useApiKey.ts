import { useCallback, useState } from 'react'

export type Provider = 'anthropic' | 'openrouter' | 'groq' | 'ollama' | 'custom'

export interface ProviderConfig {
  label: string
  defaultUrl: string
  defaultModel: string
  keyPlaceholder: string
  hintText: string
  hintUrl: string
  keyRequired: boolean
}

export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  anthropic: {
    label: 'Anthropic',
    defaultUrl: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-sonnet-4-20250514',
    keyPlaceholder: 'sk-ant-...',
    hintText: 'Get a key at console.anthropic.com',
    hintUrl: 'https://console.anthropic.com',
    keyRequired: true,
  },
  openrouter: {
    label: 'OpenRouter (free)',
    defaultUrl: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'anthropic/claude-3-haiku',
    keyPlaceholder: 'sk-or-...',
    hintText: 'Free models at openrouter.ai',
    hintUrl: 'https://openrouter.ai',
    keyRequired: true,
  },
  groq: {
    label: 'Groq (free)',
    defaultUrl: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.1-8b-instant',
    keyPlaceholder: 'gsk_...',
    hintText: 'Free key at console.groq.com',
    hintUrl: 'https://console.groq.com',
    keyRequired: true,
  },
  ollama: {
    label: 'Ollama (local)',
    defaultUrl: 'http://localhost:11434/v1/chat/completions',
    defaultModel: 'llama3.2',
    keyPlaceholder: '(no key needed)',
    hintText: 'Runs locally — install at ollama.com',
    hintUrl: 'https://ollama.com',
    keyRequired: false,
  },
  custom: {
    label: 'Custom',
    defaultUrl: '',
    defaultModel: '',
    keyPlaceholder: 'Your API key',
    hintText: 'OpenAI-compatible endpoint',
    hintUrl: '',
    keyRequired: true,
  },
}

const LS = {
  key: 'dogspeak_key',
  provider: 'dogspeak_provider',
  model: 'dogspeak_model',
  baseUrl: 'dogspeak_baseurl',
  remember: 'dogspeak_remember',
  idleMinutes: 'dogspeak_idle',
}

export const IDLE_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: 'Never', value: 0 },
]

function readLS(k: string): string {
  try { return localStorage.getItem(k) || '' } catch { return '' }
}

function readSS(k: string): string {
  try { return sessionStorage.getItem(k) || '' } catch { return '' }
}

function getStorage(remember: boolean): Storage | null {
  try { return remember ? localStorage : sessionStorage } catch { return null }
}

export function useApiKey() {
  const [remember, setRemember] = useState<boolean>(() => readLS(LS.remember) !== 'false')

  // Read from whichever storage was last used (localStorage for settings, either for key)
  const [apiKey, setApiKey] = useState<string>(() =>
    readLS(LS.key) || readSS(LS.key)
  )
  const [provider, setProvider] = useState<Provider>(() =>
    (readLS(LS.provider) as Provider) || 'anthropic'
  )
  const [model, setModel] = useState<string>(() =>
    readLS(LS.model) || PROVIDER_CONFIGS.anthropic.defaultModel
  )
  const [baseUrl, setBaseUrl] = useState<string>(() => readLS(LS.baseUrl))
  const [saved, setSaved] = useState<boolean>(() => !!(readLS(LS.key) || readSS(LS.key)))
  const [idleMinutes, setIdleMinutes] = useState<number>(() => {
    const stored = readLS(LS.idleMinutes)
    return stored !== '' ? Number(stored) : 15
  })

  const saveKey = useCallback((key: string, currentRemember = true) => {
    const storage = getStorage(currentRemember)
    const other = getStorage(!currentRemember)
    try {
      storage?.setItem(LS.key, key)
      other?.removeItem(LS.key) // clear from the other storage
    } catch {}
    setApiKey(key)
    setSaved(true)
  }, [])

  const clearKey = useCallback(() => {
    try {
      Object.values(LS).forEach(k => {
        localStorage.removeItem(k)
        sessionStorage.removeItem(k)
      })
    } catch {}
    setApiKey('')
    setSaved(false)
    setRemember(true)
    setProvider('anthropic')
    setModel(PROVIDER_CONFIGS.anthropic.defaultModel)
    setBaseUrl('')
  }, [])

  const toggleRemember = useCallback((val: boolean) => {
    setRemember(val)
    try { localStorage.setItem(LS.remember, String(val)) } catch {}
    // Move the key to the correct storage
    if (apiKey && saved) {
      saveKey(apiKey, val)
    }
  }, [apiKey, saved, saveKey])

  const changeProvider = useCallback((p: Provider) => {
    const newModel = PROVIDER_CONFIGS[p].defaultModel
    setProvider(p)
    setModel(newModel)
    try {
      localStorage.setItem(LS.provider, p)
      localStorage.setItem(LS.model, newModel)
    } catch {}
  }, [])

  const changeModel = useCallback((m: string) => {
    setModel(m)
    try { localStorage.setItem(LS.model, m) } catch {}
  }, [])

  const changeBaseUrl = useCallback((u: string) => {
    setBaseUrl(u)
    try { localStorage.setItem(LS.baseUrl, u) } catch {}
  }, [])

  const changeIdleMinutes = useCallback((minutes: number) => {
    setIdleMinutes(minutes)
    try { localStorage.setItem(LS.idleMinutes, String(minutes)) } catch {}
  }, [])

  return {
    apiKey, saved, provider, model, baseUrl, remember, idleMinutes,
    setApiKey, saveKey, clearKey,
    changeProvider, changeModel, changeBaseUrl, toggleRemember, changeIdleMinutes,
  }
}
