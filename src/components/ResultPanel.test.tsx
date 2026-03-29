import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ResultPanel from './ResultPanel'
import type { TranslationResult } from '../utils/api'

const mockResult: TranslationResult = {
  severity: 'warn',
  headline: 'High CPU usage detected',
  explanation: 'The CPU is running at 94% which is above the threshold.',
  key_facts: [
    { label: 'Where', value: 'web-prod-03' },
    { label: 'Severity', value: 'High' },
  ],
  action_needed: 'Check the server immediately.',
}

const baseProps = {
  result: null as TranslationResult | null,
  error: null as string | null,
  loading: false,
  streamingTokens: 0,
  onClear: vi.fn(),
}

describe('ResultPanel — empty state', () => {
  it('shows the empty state placeholder when no result, no error, not loading', () => {
    render(<ResultPanel {...baseProps} />)
    expect(screen.getByText('Your translation will appear here')).toBeInTheDocument()
  })
})

describe('ResultPanel — loading state', () => {
  it('shows skeleton (no empty state) while loading', () => {
    render(<ResultPanel {...baseProps} loading={true} />)
    expect(screen.queryByText('Your translation will appear here')).not.toBeInTheDocument()
  })

  it('shows streaming hint when streamingTokens > 0', () => {
    render(<ResultPanel {...baseProps} loading={true} streamingTokens={250} />)
    expect(screen.getByText(/250.*chars received/i)).toBeInTheDocument()
  })
})

describe('ResultPanel — error state', () => {
  it('shows the error message', () => {
    render(<ResultPanel {...baseProps} error="Rate limit reached. Wait a moment." />)
    expect(screen.getByText(/Rate limit reached/i)).toBeInTheDocument()
  })
})

describe('ResultPanel — result state', () => {
  it('shows the headline', () => {
    render(<ResultPanel {...baseProps} result={mockResult} />)
    expect(screen.getByText('High CPU usage detected')).toBeInTheDocument()
  })

  it('shows the explanation', () => {
    render(<ResultPanel {...baseProps} result={mockResult} />)
    expect(screen.getByText(/CPU is running at 94%/)).toBeInTheDocument()
  })

  it('shows key facts', () => {
    render(<ResultPanel {...baseProps} result={mockResult} />)
    expect(screen.getByText('Where')).toBeInTheDocument()
    expect(screen.getByText('web-prod-03')).toBeInTheDocument()
    expect(screen.getByText('Severity')).toBeInTheDocument()
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('shows the action needed', () => {
    render(<ResultPanel {...baseProps} result={mockResult} />)
    expect(screen.getByText(/Check the server immediately/)).toBeInTheDocument()
  })

  it('calls onClear when dismiss button is clicked', () => {
    const onClear = vi.fn()
    render(<ResultPanel {...baseProps} result={mockResult} onClear={onClear} />)
    fireEvent.click(screen.getByLabelText('Dismiss result'))
    expect(onClear).toHaveBeenCalled()
  })

  it('copy button invokes clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, writable: true, configurable: true })

    render(<ResultPanel {...baseProps} result={mockResult} />)
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy result to clipboard'))
    })
    expect(writeText).toHaveBeenCalled()

    const copied = writeText.mock.calls[0][0]
    expect(copied).toContain('High CPU usage detected')
    expect(copied).toContain('Check the server immediately.')
  })

  it('shows "No action needed" label when action_needed starts with that phrase', () => {
    const result = { ...mockResult, action_needed: 'No action needed — this is informational.' }
    render(<ResultPanel {...baseProps} result={result} />)
    expect(screen.getByText('No action needed')).toBeInTheDocument()
  })

  it('shows "What to do now" label for actionable results', () => {
    render(<ResultPanel {...baseProps} result={mockResult} />)
    expect(screen.getByText('What to do now')).toBeInTheDocument()
  })
})
