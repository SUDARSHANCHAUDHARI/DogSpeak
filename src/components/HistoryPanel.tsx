import React from 'react'
import { SEVERITY_CONFIG, AUDIENCE_OPTIONS } from '../utils/constants'
import type { HistoryEntry } from '../types'
import styles from './HistoryPanel.module.css'

interface Props {
  history: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onClear: () => void
}

function exportCsv(history: HistoryEntry[]) {
  const headers = ['Time', 'Severity', 'Audience', 'Headline', 'Explanation', 'Action']
  const rows = history.map(e => [
    e.time,
    e.severity,
    AUDIENCE_OPTIONS.find(a => a.key === e.audienceKey)?.label ?? e.audienceKey,
    e.parsed.headline,
    e.parsed.explanation,
    e.parsed.action_needed,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`))

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `dogspeak-history-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function HistoryPanel({ history, onSelect, onClear }: Props) {
  if (!history.length) return null

  return (
    <div className={styles.section} aria-label="Recent translations">
      <div className={styles.title}>
        Recent translations
        <div className={styles.actions}>
          <button className={styles.exportBtn} onClick={() => exportCsv(history)}>Export CSV</button>
          <button className={styles.clearBtn} onClick={() => { if (window.confirm('Clear all translation history?')) onClear() }}>Clear</button>
        </div>
      </div>
      <div className={styles.list}>
        {history.map((item, i) => {
          const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.info
          const audience = AUDIENCE_OPTIONS.find((a) => a.key === item.audienceKey)
          return (
            <button key={i} className={styles.item} onClick={() => onSelect(item)} aria-label={`Load translation: ${item.headline}`}>
              <span className={styles.dot} style={{ background: sev.dotColor }} />
              <span className={styles.headline}>{item.headline}</span>
              {audience && <span className={styles.audTag}>{audience.label}</span>}
              <span className={styles.time}>{item.time}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
