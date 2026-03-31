import React, { useState } from 'react'
import styles from './ApiKeyInput.module.css'
import { PROVIDER_CONFIGS, IDLE_OPTIONS, type Provider } from '../hooks/useApiKey'

interface Props {
  apiKey: string
  saved: boolean
  provider: Provider
  model: string
  baseUrl: string
  remember: boolean
  idleMinutes: number
  onChange: (key: string) => void
  onSave: (key: string) => void
  onClear: () => void
  onProviderChange: (p: Provider) => void
  onModelChange: (m: string) => void
  onBaseUrlChange: (u: string) => void
  onRememberChange: (val: boolean) => void
  onIdleChange: (minutes: number) => void
}

export default function ApiKeyInput({
  apiKey, saved, provider, model, baseUrl, remember, idleMinutes,
  onChange, onSave, onClear,
  onProviderChange, onModelChange, onBaseUrlChange, onRememberChange, onIdleChange,
}: Props) {
  const [showKey, setShowKey] = useState(false)
  const config = PROVIDER_CONFIGS[provider]

  return (
    <div className={`${styles.card} ${saved ? styles.saved : ''}`}>
      <div className={styles.topRow}>
        <div className={styles.field}>
          <label className={styles.label}>Provider</label>
          <select
            className={styles.select}
            value={provider}
            onChange={e => onProviderChange(e.target.value as Provider)}
          >
            {(Object.keys(PROVIDER_CONFIGS) as Provider[]).map(p => (
              <option key={p} value={p}>{PROVIDER_CONFIGS[p].label}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Model</label>
          <input
            className={styles.input}
            type="text"
            value={model}
            onChange={e => onModelChange(e.target.value)}
            placeholder={config.defaultModel || 'model name'}
            spellCheck={false}
          />
        </div>
      </div>

      {(provider === 'custom' || provider === 'ollama') && (
        <div className={styles.urlRow}>
          <label className={styles.label}>Base URL</label>
          <input
            className={styles.input}
            type="text"
            value={baseUrl || config.defaultUrl}
            onChange={e => onBaseUrlChange(e.target.value)}
            placeholder={config.defaultUrl || 'https://your-api.com/v1/chat/completions'}
            spellCheck={false}
          />
        </div>
      )}

      {config.keyRequired && (
        <>
          <label className={styles.label}>API Key</label>
          <div className={styles.row}>
            <input
              className={styles.input}
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => onChange(e.target.value)}
              placeholder={config.keyPlaceholder}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              className={styles.toggleBtn}
              onClick={() => setShowKey(v => !v)}
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? '🙈' : '👁'}
            </button>
            {saved ? (
              <button className={styles.clearBtn} onClick={onClear}>Clear</button>
            ) : (
              <button className={styles.saveBtn} onClick={() => onSave(apiKey)}>Save</button>
            )}
          </div>
          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => onRememberChange(e.target.checked)}
                  className={styles.checkbox}
                />
                Remember across sessions
              </label>
              <label className={styles.rememberLabel}>
                Auto-clear after:
                <select
                  className={styles.idleSelect}
                  value={idleMinutes}
                  onChange={e => onIdleChange(Number(e.target.value))}
                >
                  {IDLE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <span className={styles.hint}>
              Stored only in your browser.{' '}
              {config.hintUrl ? (
                <a href={config.hintUrl} target="_blank" rel="noreferrer">
                  {config.hintText} →
                </a>
              ) : config.hintText}
            </span>
          </div>
        </>
      )}

      {!config.keyRequired && (
        <p className={styles.hint}>{config.hintText}</p>
      )}
    </div>
  )
}
