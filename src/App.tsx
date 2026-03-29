import React, { useState } from 'react'
import Navbar from './components/Navbar'
import ApiKeyInput from './components/ApiKeyInput'
import InputPanel from './components/InputPanel'
import ResultPanel from './components/ResultPanel'
import HistoryPanel from './components/HistoryPanel'
import { useTranslation } from './hooks/useTranslation'
import { useApiKey } from './hooks/useApiKey'
import type { HistoryEntry } from './types'
import styles from './App.module.css'

export default function App() {
  const [input, setInput] = useState('')
  const [audience, setAudience] = useState('non-technical')

  const { apiKey, saved, setApiKey, saveKey, clearKey } = useApiKey()
  const {
    loading, result, error, history, streamingTokens,
    translate, loadFromHistory, clearResult, clearHistory,
  } = useTranslation()

  function handleTranslate() {
    translate(input, audience, apiKey)
  }

  function handleHistorySelect(entry: HistoryEntry) {
    const restoredInput = loadFromHistory(entry)
    setInput(restoredInput)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.app}>
      <Navbar />

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Datadog,<br />in plain English.
        </h1>
        <p className={styles.heroSub}>
          Paste any Datadog alert, metric, log, or monitor. Get a clear explanation anyone —
          engineers, managers, or non-technical teammates — can actually understand.
        </p>
      </div>

      <ApiKeyInput
        apiKey={apiKey}
        saved={saved}
        onChange={setApiKey}
        onSave={saveKey}
        onClear={clearKey}
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
