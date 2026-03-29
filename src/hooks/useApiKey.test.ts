import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApiKey } from './useApiKey'

beforeEach(() => {
  localStorage.clear()
})

describe('useApiKey', () => {
  it('starts empty when localStorage has no key', () => {
    const { result } = renderHook(() => useApiKey())
    expect(result.current.apiKey).toBe('')
    expect(result.current.saved).toBe(false)
  })

  it('loads an existing key from localStorage on mount', () => {
    localStorage.setItem('dogspeak_key', 'sk-ant-existing')
    const { result } = renderHook(() => useApiKey())
    expect(result.current.apiKey).toBe('sk-ant-existing')
    expect(result.current.saved).toBe(true)
  })

  it('saveKey persists key and sets saved=true', () => {
    const { result } = renderHook(() => useApiKey())
    act(() => {
      result.current.saveKey('sk-ant-new')
    })
    expect(result.current.apiKey).toBe('sk-ant-new')
    expect(result.current.saved).toBe(true)
    expect(localStorage.getItem('dogspeak_key')).toBe('sk-ant-new')
  })

  it('clearKey removes key from state and localStorage', () => {
    localStorage.setItem('dogspeak_key', 'sk-ant-existing')
    const { result } = renderHook(() => useApiKey())
    act(() => {
      result.current.clearKey()
    })
    expect(result.current.apiKey).toBe('')
    expect(result.current.saved).toBe(false)
    expect(localStorage.getItem('dogspeak_key')).toBeNull()
  })

  it('setApiKey updates state without saving to localStorage', () => {
    const { result } = renderHook(() => useApiKey())
    act(() => {
      result.current.setApiKey('sk-ant-typing')
    })
    expect(result.current.apiKey).toBe('sk-ant-typing')
    expect(localStorage.getItem('dogspeak_key')).toBeNull()
    expect(result.current.saved).toBe(false)
  })
})
