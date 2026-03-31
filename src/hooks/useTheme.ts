import { useCallback, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'
const KEY = 'dogspeak_theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (localStorage.getItem(KEY) as Theme) || 'dark' } catch { return 'dark' }
  })

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light')
    try { localStorage.setItem(KEY, theme) } catch {}
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, toggle }
}
