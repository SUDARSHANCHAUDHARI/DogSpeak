import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ApiKeyInput from './ApiKeyInput'

const defaultProps = {
  apiKey: '',
  saved: false,
  provider: 'anthropic' as const,
  model: 'claude-sonnet-4-20250514',
  baseUrl: '',
  remember: true,
  idleMinutes: 15,
  onChange: vi.fn(),
  onSave: vi.fn(),
  onClear: vi.fn(),
  onProviderChange: vi.fn(),
  onModelChange: vi.fn(),
  onBaseUrlChange: vi.fn(),
  onRememberChange: vi.fn(),
  onIdleChange: vi.fn(),
}

describe('ApiKeyInput', () => {
  it('renders the input with correct placeholder', () => {
    render(<ApiKeyInput {...defaultProps} />)
    expect(screen.getByPlaceholderText('sk-ant-...')).toBeInTheDocument()
  })

  it('renders as password type by default', () => {
    render(<ApiKeyInput {...defaultProps} />)
    expect(screen.getByPlaceholderText('sk-ant-...')).toHaveAttribute('type', 'password')
  })

  it('toggle button shows/hides the key', () => {
    render(<ApiKeyInput {...defaultProps} />)
    const input = screen.getByPlaceholderText('sk-ant-...')

    fireEvent.click(screen.getByLabelText('Show API key'))
    expect(input).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByLabelText('Hide API key'))
    expect(input).toHaveAttribute('type', 'password')
  })

  it('calls onChange when typing', () => {
    const onChange = vi.fn()
    render(<ApiKeyInput {...defaultProps} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText('sk-ant-...'), { target: { value: 'sk-ant-abc' } })
    expect(onChange).toHaveBeenCalledWith('sk-ant-abc')
  })

  it('shows Save button when not saved', () => {
    render(<ApiKeyInput {...defaultProps} saved={false} />)
    expect(screen.getByText('Save')).toBeInTheDocument()
    expect(screen.queryByText('Clear')).not.toBeInTheDocument()
  })

  it('shows Clear button when saved', () => {
    render(<ApiKeyInput {...defaultProps} saved={true} />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
  })

  it('calls onSave with current apiKey when Save is clicked', () => {
    const onSave = vi.fn()
    render(<ApiKeyInput {...defaultProps} apiKey="sk-ant-test" onSave={onSave} saved={false} />)
    fireEvent.click(screen.getByText('Save'))
    expect(onSave).toHaveBeenCalledWith('sk-ant-test')
  })

  it('calls onClear when Clear is clicked', () => {
    const onClear = vi.fn()
    render(<ApiKeyInput {...defaultProps} saved={true} onClear={onClear} />)
    fireEvent.click(screen.getByText('Clear'))
    expect(onClear).toHaveBeenCalled()
  })

  it('shows a hint about localStorage storage', () => {
    render(<ApiKeyInput {...defaultProps} />)
    expect(screen.getByText(/localStorage/i)).toBeInTheDocument()
  })
})
