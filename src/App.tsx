import React, { useState, useCallback } from 'react'
import Navbar from './components/Navbar'
import ApiKeyInput from './components/ApiKeyInput'
import InputPanel from './components/InputPanel'
import ResultPanel from './components/ResultPanel'
import HistoryPanel from './components/HistoryPanel'
import { useTranslation } from './hooks/useTranslation'
import { useApiKey } from './hooks/useApiKey'
import { useIdleTimeout } from './hooks/useIdleTimeout'
import { useTheme } from './hooks/useTheme'
import type { HistoryEntry } from './types'
import styles from './App.module.css'

export default function App() {
  const [input, setInput] = useState('')
  const [audience, setAudience] = useState('non-technical')
  const { theme, toggle: toggleTheme } = useTheme()

  const { apiKey, saved, provider, model, baseUrl, remember, idleMinutes, setApiKey, saveKey, clearKey, changeProvider, changeModel, changeBaseUrl, toggleRemember, changeIdleMinutes } = useApiKey()
  const [idleCleared, setIdleCleared] = useState(false)

  const handleIdle = useCallback(() => {
    clearKey()
    setIdleCleared(true)
    setTimeout(() => setIdleCleared(false), 5000)
  }, [clearKey])

  useIdleTimeout(handleIdle, idleMinutes * 60 * 1000, saved && idleMinutes > 0)
  const {
    loading, result, error, history, streamingTokens,
    translate, loadFromHistory, clearResult, clearHistory,
  } = useTranslation()

  function handleTranslate() {
    translate(input, audience, apiKey, { provider, model, baseUrl })
  }

  function handleHistorySelect(entry: HistoryEntry) {
    const restoredInput = loadFromHistory(entry)
    setInput(restoredInput)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.app}>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Datadog,<br />in plain English.
        </h1>
        <p className={styles.heroSub}>
          Paste any Datadog alert, metric, log, or monitor. Get a clear explanation anyone —
          engineers, managers, or non-technical teammates — can actually understand.
        </p>
      </div>

      {idleCleared && (
        <div className={styles.idleBanner}>
          API key cleared due to inactivity.
        </div>
      )}

      <ApiKeyInput
        apiKey={apiKey}
        saved={saved}
        provider={provider}
        model={model}
        baseUrl={baseUrl}
        remember={remember}
        idleMinutes={idleMinutes}
        onChange={setApiKey}
        onSave={saveKey}
        onClear={clearKey}
        onProviderChange={changeProvider}
        onModelChange={changeModel}
        onBaseUrlChange={changeBaseUrl}
        onRememberChange={toggleRemember}
        onIdleChange={changeIdleMinutes}
      />

      <InputPanel
        value={input}
        audience={audience}
        loading={loading}
        onChange={setInput}
        onAudienceChange={setAudience}
        onTranslate={handleTranslate}
      />

      <ResultPanel
        result={result}
        error={error}
        loading={loading}
        streamingTokens={streamingTokens}
        onClear={clearResult}
      />

      <HistoryPanel history={history} onSelect={handleHistorySelect} onClear={clearHistory} />

      <footer className={styles.footer}>
        DogSpeak — Datadog plain English translator · Powered by Claude
      </footer>
    </div>
  )
}
