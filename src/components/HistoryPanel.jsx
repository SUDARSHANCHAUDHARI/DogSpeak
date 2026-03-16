import React from 'react'
import { SEVERITY_CONFIG, AUDIENCE_OPTIONS } from '../utils/constants'
import styles from './HistoryPanel.module.css'

export default function HistoryPanel({ history, onSelect, onClear }) {
  if (!history.length) return null

  return (
    <div className={styles.section}>
      <div className={styles.title}>
        Recent translations
        <button className={styles.clearBtn} onClick={onClear}>Clear</button>
      </div>
      <div className={styles.list}>
        {history.map((item, i) => {
          const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.info
          const audience = AUDIENCE_OPTIONS.find((a) => a.key === item.audienceKey)
          return (
            <button key={i} className={styles.item} onClick={() => onSelect(item)}>
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
