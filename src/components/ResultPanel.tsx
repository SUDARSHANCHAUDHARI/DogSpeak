import React, { useState } from 'react'
import { SEVERITY_CONFIG } from '../utils/constants'
import type { TranslationResult } from '../types'
import styles from './ResultPanel.module.css'

function formatSlack(result: TranslationResult): string {
  const sev = SEVERITY_CONFIG[result.severity]
  const facts = result.key_facts?.map(f => `• *${f.label}:* ${f.value}`).join('\n') ?? ''
  return [
    `${sev.icon} *${result.headline}*`,
    '',
    result.explanation,
    '',
    facts,
    '',
    `⚡ *Action:* ${result.action_needed}`,
    '',
    '_via DogSpeak_',
  ].join('\n')
}

interface Props {
  result: TranslationResult | null
  error: string | null
  loading: boolean
  streamingTokens: number
  onClear: () => void
}

export default function ResultPanel({ result, error, loading, streamingTokens, onClear }: Props) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  function handleShare() {
    if (!result) return
    navigator.clipboard.writeText(formatSlack(result)).then(() => {
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }).catch(() => {
      setShared(false)
    })
  }

  function handleCopy() {
    if (!result) return
    const text = [
      result.headline,
      '',
      result.explanation,
      '',
      ...(result.key_facts?.map((f) => `${f.label}: ${f.value}`) ?? []),
      '',
      `Action: ${result.action_needed}`,
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      setCopied(false)
    })
  }

  // Loading skeleton
  if (loading && !result) {
    return (
      <div className={styles.skeleton} role="status" aria-live="polite" aria-label="Translating…">
        <div className={styles.skelBadge} />
        <div className={styles.skelHeadline} />
        <div className={styles.skelLine} />
        <div className={`${styles.skelLine} ${styles.skelLineShort}`} />
        <div className={styles.skelGrid}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={styles.skelCard} />)}
        </div>
        {streamingTokens > 0 && (
          <p className={styles.streamingHint}>{streamingTokens.toLocaleString()} chars received…</p>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorBox} role="alert">
        <strong>Error:</strong> {error}
      </div>
    )
  }

  if (!result) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyDot} />
        <p className={styles.emptyText}>Your translation will appear here</p>
      </div>
    )
  }

  const sev = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.info
  const isNoAction =
    result.action_needed &&
    result.action_needed.toLowerCase().includes('no action needed')

  return (
    <div className={styles.result}>
      {/* Header row */}
      <div className={styles.header}>
        <span className={`${styles.badge} ${styles[result.severity]}`}>
          <span
            className={styles.dot}
            style={{
              background: sev.dotColor,
              animation: result.severity === 'critical' ? 'critpulse 1s ease-in-out infinite' : 'none',
            }}
          />
          {sev.label}
        </span>
        <div className={styles.resultActions}>
          <button className={styles.actionBtn} onClick={handleCopy} aria-label="Copy result to clipboard">
            {copied ? '✓ Copied' : 'Copy'}
          </button>
          <button className={styles.actionBtn} onClick={handleShare} aria-label="Copy as Slack/Teams message">
            {shared ? '✓ Shared' : 'Share'}
          </button>
          <button className={styles.actionBtn} onClick={onClear} aria-label="Dismiss result">✕</button>
        </div>
      </div>

      {/* Headline */}
      <h2 className={styles.headline}>{result.headline}</h2>

      {/* Explanation */}
      <p className={styles.explanation}>{result.explanation}</p>

      {/* Fact cards */}
      {result.key_facts?.length > 0 && (
        <div className={styles.factGrid}>
          {result.key_facts.map((fact) => (
            <div key={fact.label} className={styles.factCard}>
              <div className={styles.factLabel}>{fact.label}</div>
              <div className={styles.factValue}>{fact.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Action box */}
      {result.action_needed && (
        <div className={`${styles.actionBox} ${styles[`action_${result.severity}`]}`}>
          <span className={styles.actionIcon}>{isNoAction ? '✓' : sev.icon}</span>
          <div>
            <strong>{isNoAction ? 'No action needed' : 'What to do now'}</strong>
            <p>{result.action_needed}</p>
          </div>
        </div>
      )}
    </div>
  )
}
