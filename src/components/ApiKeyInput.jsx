import React, { useState } from 'react'
import styles from './ApiKeyInput.module.css'

export default function ApiKeyInput({ apiKey, saved, onChange, onSave, onClear }) {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className={`${styles.card} ${saved ? styles.saved : ''}`}>
      <label className={styles.label}>Anthropic API Key</label>
      <div className={styles.row}>
        <input
          className={styles.input}
          type={showKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-ant-..."
          autoComplete="off"
          spellCheck={false}
        />
        <button className={styles.toggleBtn} onClick={() => setShowKey((v) => !v)} title="Toggle visibility">
          {showKey ? '🙈' : '👁'}
        </button>
        {saved ? (
          <button className={styles.clearBtn} onClick={onClear}>Clear</button>
        ) : (
          <button className={styles.saveBtn} onClick={() => onSave(apiKey)}>Save</button>
        )}
      </div>
      <p className={styles.hint}>
        Stored only in your browser's localStorage.{' '}
        <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
          Get a key →
        </a>
      </p>
    </div>
  )
}
