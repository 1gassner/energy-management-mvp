import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    const customText = 'Loading data...'
    render(<LoadingSpinner text={customText} />)
    
    expect(screen.getByText(customText)).toBeInTheDocument()
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(document.querySelector('.w-4')).toBeInTheDocument()

    rerender(<LoadingSpinner size="md" />)
    expect(document.querySelector('.w-8')).toBeInTheDocument()

    rerender(<LoadingSpinner size="lg" />)
    expect(document.querySelector('.w-12')).toBeInTheDocument()
  })

  it('applies custom color', () => {
    render(<LoadingSpinner color="text-red-500" />)
    expect(document.querySelector('.text-red-500')).toBeInTheDocument()
  })
})