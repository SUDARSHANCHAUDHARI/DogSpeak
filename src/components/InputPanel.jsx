import React, { useRef, useEffect } from 'react'
import { EXAMPLES, AUDIENCE_OPTIONS } from '../utils/constants'
import styles from './InputPanel.module.css'

export default function InputPanel({ value, audience, loading, onChange, onAudienceChange, onTranslate }) {
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!loading && value.trim()) onTranslate()
    }
  }

  const tokenEstimate = Math.ceil(value.length / 4)

  return (
    <div className={styles.wrapper}>
      {/* Examples */}
      <p className={styles.exLabel}>Try an example</p>
      <div className={styles.examples}>
        {EXAMPLES.map((ex) => (
          <button key={ex.label} className={styles.chip} onClick={() => onChange(ex.text)}>
            {ex.label}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.inputTag}>Datadog Input</span>
          <span className={styles.charCount}>
            {value.length.toLocaleString()} chars
            {value.length > 0 && (
              <span className={styles.tokenEst}> · ~{tokenEstimate.toLocaleString()} tokens</span>
            )}
          </span>
        </div>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste a Datadog alert, log line, metric, monitor trigger, trace, or error message here..."
        />
      </div>

      {/* Audience */}
      <div className={styles.audienceRow}>
        <span className={styles.audLabel}>Explain for:</span>
        <div className={styles.audBtns}>
          {AUDIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.audBtn} ${audience === opt.key ? styles.active : ''}`}
              onClick={() => onAudienceChange(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        className={styles.translateBtn}
        onClick={onTranslate}
        disabled={loading || !value.trim()}
      >
        {loading && <span className={styles.spinner} />}
        <span>{loading ? 'Translating...' : 'Translate to plain English'}</span>
        {!loading && <span className={styles.kbdHint}>⌘↵</span>}
      </button>
    </div>
  )
}
