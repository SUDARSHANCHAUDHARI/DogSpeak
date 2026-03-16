import React from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <div className={styles.logoDot} />
        DogSpeak
      </div>
      <div className={styles.badge}>v1.0 · AI-powered</div>
    </nav>
  )
}
