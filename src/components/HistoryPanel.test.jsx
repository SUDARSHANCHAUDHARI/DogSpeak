import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HistoryPanel from './HistoryPanel'

const mockHistory = [
  {
    headline: 'High CPU usage detected',
    severity: 'warn',
    audienceKey: 'non-technical',
    time: '10:30',
    parsed: {},
    input: 'cpu input',
  },
  {
    headline: 'Payment API error rate critical',
    severity: 'critical',
    audienceKey: 'manager',
    time: '10:45',
    parsed: {},
    input: 'payment input',
  },
]

describe('HistoryPanel', () => {
  it('renders nothing when history is empty', () => {
    const { container } = render(<HistoryPanel history={[]} onSelect={vi.fn()} onClear={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all history items', () => {
    render(<HistoryPanel history={mockHistory} onSelect={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('High CPU usage detected')).toBeInTheDocument()
    expect(screen.getByText('Payment API error rate critical')).toBeInTheDocument()
  })

  it('shows timestamps', () => {
    render(<HistoryPanel history={mockHistory} onSelect={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('10:30')).toBeInTheDocument()
    expect(screen.getByText('10:45')).toBeInTheDocument()
  })

  it('shows audience tags', () => {
    render(<HistoryPanel history={mockHistory} onSelect={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText('Non-technical')).toBeInTheDocument()
    expect(screen.getByText('Manager / exec')).toBeInTheDocument()
  })

  it('calls onSelect with the correct entry when clicked', () => {
    const onSelect = vi.fn()
    render(<HistoryPanel history={mockHistory} onSelect={onSelect} onClear={vi.fn()} />)
    fireEvent.click(screen.getByText('High CPU usage detected'))
    expect(onSelect).toHaveBeenCalledWith(mockHistory[0])
  })

  it('calls onClear when Clear button is clicked', () => {
    const onClear = vi.fn()
    render(<HistoryPanel history={mockHistory} onSelect={vi.fn()} onClear={onClear} />)
    fireEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalled()
  })

  it('shows the "Recent translations" section title', () => {
    render(<HistoryPanel history={mockHistory} onSelect={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByText(/Recent translations/i)).toBeInTheDocument()
  })
})
