import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdDisplay } from '@/components/AdDisplay'
import { useFaucet } from '@/context/FaucetContext'

// Mock the FaucetContext
jest.mock('@/context/FaucetContext')

const mockUseFaucet = useFaucet as jest.MockedFunction<typeof useFaucet>

describe('AdDisplay', () => {
  const mockOnAdVerified = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders initial state with start button', () => {
    mockUseFaucet.mockReturnValue({
      verifyAd: jest.fn(),
      isVerifyingAd: false,
      adHash: null,
    } as any)

    render(<AdDisplay onAdVerified={mockOnAdVerified} />)

    expect(screen.getByText('Watch Ad to Continue')).toBeInTheDocument()
    expect(screen.getByText('Start Watching Ad')).toBeInTheDocument()
  })

  it('shows verified state when ad hash exists', () => {
    mockUseFaucet.mockReturnValue({
      verifyAd: jest.fn(),
      isVerifyingAd: false,
      adHash: 'abc123456789',
    } as any)

    render(<AdDisplay onAdVerified={mockOnAdVerified} />)

    expect(screen.getByText('Ad Verified!')).toBeInTheDocument()
    expect(screen.getByText('You can now claim your ETH.')).toBeInTheDocument()
  })

  it('starts watching when start button is clicked', () => {
    mockUseFaucet.mockReturnValue({
      verifyAd: jest.fn(),
      isVerifyingAd: false,
      adHash: null,
    } as any)

    render(<AdDisplay onAdVerified={mockOnAdVerified} />)

    const startButton = screen.getByText('Start Watching Ad')
    fireEvent.click(startButton)

    expect(screen.getByText('Watching... 0/10s')).toBeInTheDocument()
  })

  it('progresses through watching timer', async () => {
    mockUseFaucet.mockReturnValue({
      verifyAd: jest.fn(),
      isVerifyingAd: false,
      adHash: null,
    } as any)

    render(<AdDisplay onAdVerified={mockOnAdVerified} />)

    const startButton = screen.getByText('Start Watching Ad')
    fireEvent.click(startButton)

    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(screen.getByText('Watching... 5/10s')).toBeInTheDocument()
    })
  })

  it('shows verify button after watching completes', async () => {
    mockUseFaucet.mockReturnValue({
      verifyAd: jest.fn(),
      isVerifyingAd: false,
      adHash: null,
    } as any)

    render(<AdDisplay onAdVerified={mockOnAdVerified} />)

    const startButton = screen.getByText('Start Watching Ad')
    fireEvent.click(startButton)

    // Fast-forward 10 seconds to complete watching
    jest.advanceTimersByTime(10000)

    await waitFor(() => {
      expect(screen.getByText('Verify Ad Completion')).toBeInTheDocument()
    })
  })

  it('calls verifyAd when verify button is clicked', async () => {
    const mockVerifyAd = jest.fn()
    
    mockUseFaucet.mockReturnValue({
      verifyAd: mockVerifyAd,
      isVerifyingAd: false,
      adHash: null,
    } as any)

    render(<AdDisplay onAdVerified={mockOnAdVerified} />)

    const startButton = screen.getByText('Start Watching Ad')
    fireEvent.click(startButton)

    // Complete watching
    jest.advanceTimersByTime(10000)

    await waitFor(() => {
      const verifyButton = screen.getByText('Verify Ad Completion')
      fireEvent.click(verifyButton)
    })

    expect(mockVerifyAd).toHaveBeenCalledWith(10)
  })
})