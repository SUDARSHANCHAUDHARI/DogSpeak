import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InputPanel from './InputPanel'

const defaultProps = {
  value: '',
  audience: 'non-technical',
  loading: false,
  onChange: vi.fn(),
  onAudienceChange: vi.fn(),
  onTranslate: vi.fn(),
}

describe('InputPanel', () => {
  it('renders the textarea with placeholder', () => {
    render(<InputPanel {...defaultProps} />)
    expect(screen.getByPlaceholderText(/Paste a Datadog alert/i)).toBeInTheDocument()
  })

  it('renders all example chips', () => {
    render(<InputPanel {...defaultProps} />)
    expect(screen.getByText('[P1] Payment API')).toBeInTheDocument()
    expect(screen.getByText('CPU spike')).toBeInTheDocument()
    expect(screen.getByText('DB timeout error')).toBeInTheDocument()
    expect(screen.getByText('Latency WARN')).toBeInTheDocument()
    expect(screen.getByText('Memory OOM')).toBeInTheDocument()
  })

  it('clicking an example chip calls onChange with example text', () => {
    const onChange = vi.fn()
    render(<InputPanel {...defaultProps} onChange={onChange} />)
    fireEvent.click(screen.getByText('[P1] Payment API'))
    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls[0][0]).toContain('payment-api')
  })

  it('renders all three audience buttons', () => {
    render(<InputPanel {...defaultProps} />)
    expect(screen.getByText('Non-technical')).toBeInTheDocument()
    expect(screen.getByText('Manager / exec')).toBeInTheDocument()
    expect(screen.getByText('Junior developer')).toBeInTheDocument()
  })

  it('calls onAudienceChange with the correct key', () => {
    const onAudienceChange = vi.fn()
    render(<InputPanel {...defaultProps} onAudienceChange={onAudienceChange} />)
    fireEvent.click(screen.getByText('Manager / exec'))
    expect(onAudienceChange).toHaveBeenCalledWith('manager')
    fireEvent.click(screen.getByText('Junior developer'))
    expect(onAudienceChange).toHaveBeenCalledWith('developer')
  })

  it('translate button is disabled when value is empty', () => {
    render(<InputPanel {...defaultProps} value="" />)
    expect(screen.getByRole('button', { name: /Translate to plain English/i })).toBeDisabled()
  })

  it('translate button is disabled when loading', () => {
    render(<InputPanel {...defaultProps} value="some input" loading={true} />)
    expect(screen.getByRole('button', { name: /Translating/i })).toBeDisabled()
  })

  it('translate button is enabled with non-empty value and not loading', () => {
    render(<InputPanel {...defaultProps} value="some input" />)
    expect(screen.getByRole('button', { name: /Translate to plain English/i })).not.toBeDisabled()
  })

  it('calls onTranslate when button is clicked', () => {
    const onTranslate = vi.fn()
    render(<InputPanel {...defaultProps} value="some input" onTranslate={onTranslate} />)
    fireEvent.click(screen.getByRole('button', { name: /Translate to plain English/i }))
    expect(onTranslate).toHaveBeenCalled()
  })

  it('shows length warning for inputs over 8000 chars', () => {
    render(<InputPanel {...defaultProps} value={'a'.repeat(8001)} />)
    expect(screen.getByText(/consider trimming/i)).toBeInTheDocument()
  })

  it('does not show length warning for short inputs', () => {
    render(<InputPanel {...defaultProps} value="short input" />)
    expect(screen.queryByText(/consider trimming/i)).not.toBeInTheDocument()
  })

  it('shows char count when value is non-empty', () => {
    render(<InputPanel {...defaultProps} value="hello" />)
    expect(screen.getByText(/5 chars/)).toBeInTheDocument()
  })
})
