import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTranslation } from './useTranslation'
import { translateDatadog } from '../utils/api'

vi.mock('../utils/api', () => ({
  translateDatadog: vi.fn(),
}))

const mockResult = {
  severity: 'warn',
  headline: 'High CPU detected',
  explanation: 'CPU is running hot.',
  key_facts: [{ label: 'Where', value: 'web-01' }],
  action_needed: 'Check the server.',
}

beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
})

describe('useTranslation — initial state', () => {
  it('starts with no result, no error, not loading', () => {
    const { result } = renderHook(() => useTranslation())
    expect(result.current.loading).toBe(false)
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.history).toEqual([])
    expect(result.current.streamingTokens).toBe(0)
  })

  it('loads history from localStorage on mount', () => {
    const stored = [{ headline: 'Stored alert', severity: 'ok', audienceKey: 'non-technical', time: '10:00', parsed: mockResult, input: 'test' }]
    localStorage.setItem('dogspeak_history', JSON.stringify(stored))
    const { result } = renderHook(() => useTranslation())
    expect(result.current.history).toHaveLength(1)
    expect(result.current.history[0].headline).toBe('Stored alert')
  })
})

describe('useTranslation — translate', () => {
  it('calls translateDatadog and sets result on success', async () => {
    translateDatadog.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate('some input', 'non-technical', 'api-key')
    })

    expect(result.current.result).toEqual(mockResult)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
  })

  it('adds translation to history with correct fields', async () => {
    translateDatadog.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate('some input', 'non-technical', 'api-key')
    })

    expect(result.current.history).toHaveLength(1)
    const entry = result.current.history[0]
    expect(entry.headline).toBe('High CPU detected')
    expect(entry.severity).toBe('warn')
    expect(entry.audienceKey).toBe('non-technical')
    expect(entry.input).toBe('some input')
    expect(entry.parsed).toEqual(mockResult)
  })

  it('persists history to localStorage', async () => {
    translateDatadog.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate('some input', 'non-technical', 'api-key')
    })

    const saved = JSON.parse(localStorage.getItem('dogspeak_history'))
    expect(saved).toHaveLength(1)
    expect(saved[0].headline).toBe('High CPU detected')
  })

  it('sets error and does not add to history on failure', async () => {
    translateDatadog.mockRejectedValue(new Error('Rate limit reached'))
    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate('some input', 'non-technical', 'api-key')
    })

    expect(result.current.error).toBe('Rate limit reached')
    expect(result.current.result).toBeNull()
    expect(result.current.history).toHaveLength(0)
  })

  it('does nothing when input is empty or whitespace', async () => {
    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate('   ', 'non-technical', 'api-key')
    })

    expect(translateDatadog).not.toHaveBeenCalled()
  })

  it('does nothing when audienceKey is invalid', async () => {
    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate('some input', 'invalid-key', 'api-key')
    })

    expect(translateDatadog).not.toHaveBeenCalled()
  })
})

describe('useTranslation — history management', () => {
  it('loadFromHistory sets result and returns input', () => {
    const entry = { parsed: mockResult, input: 'original input', headline: 'test', severity: 'ok', audienceKey: 'non-technical', time: '12:00' }
    const { result } = renderHook(() => useTranslation())

    let returned
    act(() => {
      returned = result.current.loadFromHistory(entry)
    })

    expect(result.current.result).toEqual(mockResult)
    expect(result.current.error).toBeNull()
    expect(returned).toBe('original input')
  })

  it('clearResult resets result and error', async () => {
    translateDatadog.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate('some input', 'non-technical', 'api-key')
    })
    act(() => { result.current.clearResult() })

    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('clearHistory empties history and localStorage', async () => {
    translateDatadog.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useTranslation())

    await act(async () => {
      await result.current.translate('some input', 'non-technical', 'api-key')
    })
    act(() => { result.current.clearHistory() })

    expect(result.current.history).toHaveLength(0)
    expect(localStorage.getItem('dogspeak_history')).toBeNull()
  })

  it('caps history at 10 entries', async () => {
    translateDatadog.mockResolvedValue(mockResult)
    const { result } = renderHook(() => useTranslation())

    for (let i = 0; i < 12; i++) {
      await act(async () => {
        await result.current.translate(`input ${i}`, 'non-technical', 'api-key')
      })
    }

    expect(result.current.history).toHaveLength(10)
  })
})
