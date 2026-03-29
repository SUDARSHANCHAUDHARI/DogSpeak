import React, { useRef, useEffect } from 'react'
import { EXAMPLES, AUDIENCE_OPTIONS } from '../utils/constants'
import styles from './InputPanel.module.css'

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
const MAX_CHARS = 8000

interface Props {
  value: string
  audience: string
  loading: boolean
  onChange: (value: string) => void
  onAudienceChange: (key: string) => void
  onTranslate: () => void
}

export default function InputPanel({ value, audience, loading, onChange, onAudienceChange, onTranslate }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      if (!loading && value.trim() && value.length <= MAX_CHARS) onTranslate()
    }
  }

  const tokenEstimate = Math.ceil(value.length / 4)
  const tooLong = value.length > MAX_CHARS

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
          aria-label="Datadog input"
          aria-describedby={tooLong ? 'length-warn' : undefined}
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

      {/* Length warning */}
      {tooLong && (
        <p id="length-warn" role="alert" className={styles.lengthWarn}>
          Input is {value.length.toLocaleString()} chars — consider trimming to the most relevant part to save tokens and improve accuracy.
        </p>
      )}

      {/* Submit */}
      <button
        className={styles.translateBtn}
        onClick={onTranslate}
        disabled={loading || !value.trim() || tooLong}
        aria-label={loading ? 'Translating, please wait' : 'Translate to plain English'}
        aria-busy={loading}
      >
        {loading && <span className={styles.spinner} />}
        <span>{loading ? 'Translating...' : 'Translate to plain English →'}</span>
        {!loading && <span className={styles.kbdHint}>{isMac ? '⌘↵' : 'Ctrl+↵'}</span>}
      </button>
    </div>
  )
}
