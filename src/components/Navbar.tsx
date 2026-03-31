import React from 'react'
import styles from './Navbar.module.css'

interface Props {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function Navbar({ theme, onToggleTheme }: Props) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <div className={styles.logoDot} />
        DogSpeak
      </div>
      <div className={styles.right}>
        <button
          className={styles.themeBtn}
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className={styles.badge}>v1.0 · AI-powered</div>
      </div>
    </nav>
  )
}
