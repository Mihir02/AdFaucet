import { render, screen, fireEvent } from '@testing-library/react'
import { WalletConnect } from '@/components/WalletConnect'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

// Mock wagmi hooks
jest.mock('wagmi')

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>
const mockUseConnect = useConnect as jest.MockedFunction<typeof useConnect>
const mockUseDisconnect = useDisconnect as jest.MockedFunction<typeof useDisconnect>

describe('WalletConnect', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders connect buttons when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any)

    mockUseConnect.mockReturnValue({
      connectors: [
        { uid: '1', name: 'MetaMask' },
        { uid: '2', name: 'Browser Wallet' },
      ],
      connect: jest.fn(),
    } as any)

    mockUseDisconnect.mockReturnValue({
      disconnect: jest.fn(),
    } as any)

    render(<WalletConnect />)

    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument()
    expect(screen.getByText('MetaMask')).toBeInTheDocument()
    expect(screen.getByText('Browser Wallet')).toBeInTheDocument()
  })

  it('renders connected state when wallet is connected', () => {
    const mockAddress = '0x1234567890123456789012345678901234567890'
    
    mockUseAccount.mockReturnValue({
      address: mockAddress,
      isConnected: true,
    } as any)

    mockUseConnect.mockReturnValue({
      connectors: [],
      connect: jest.fn(),
    } as any)

    mockUseDisconnect.mockReturnValue({
      disconnect: jest.fn(),
    } as any)

    render(<WalletConnect />)

    expect(screen.getByText('Connected')).toBeInTheDocument()
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
    expect(screen.getByText('Disconnect')).toBeInTheDocument()
  })

  it('calls connect function when connect button is clicked', () => {
    const mockConnect = jest.fn()
    
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
    } as any)

    mockUseConnect.mockReturnValue({
      connectors: [{ uid: '1', name: 'MetaMask' }],
      connect: mockConnect,
    } as any)

    mockUseDisconnect.mockReturnValue({
      disconnect: jest.fn(),
    } as any)

    render(<WalletConnect />)

    const connectButton = screen.getByText('MetaMask')
    fireEvent.click(connectButton)

    expect(mockConnect).toHaveBeenCalledWith({
      connector: { uid: '1', name: 'MetaMask' },
    })
  })

  it('calls disconnect function when disconnect button is clicked', () => {
    const mockDisconnect = jest.fn()
    
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
    } as any)

    mockUseConnect.mockReturnValue({
      connectors: [],
      connect: jest.fn(),
    } as any)

    mockUseDisconnect.mockReturnValue({
      disconnect: mockDisconnect,
    } as any)

    render(<WalletConnect />)

    const disconnectButton = screen.getByText('Disconnect')
    fireEvent.click(disconnectButton)

    expect(mockDisconnect).toHaveBeenCalled()
  })
})