import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PhoneNumberEditor from '@/app/dashboard/homeowners/[id]/PhoneNumberEditor'

const mockRefresh = jest.fn()
const mockUpdate = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

jest.mock('@/lib/api/client', () => ({
  updateHomeownerPhone: (...args: unknown[]) => mockUpdate(...args),
}))

describe('PhoneNumberEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders current phone and edit button', () => {
    render(<PhoneNumberEditor userId="u1" phoneNumber="+15550001111" />)
    expect(screen.getByText('+15550001111')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('cancel reverts to initial phone value', () => {
    render(<PhoneNumberEditor userId="u1" phoneNumber="+15550001111" />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByPlaceholderText('+15551234567'), { target: { value: '+15553333333' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.getByText('+15550001111')).toBeInTheDocument()
  })

  it('shows API error on failure', async () => {
    mockUpdate.mockResolvedValue({ ok: false, json: async () => ({ error: 'Invalid phone number' }) })
    render(<PhoneNumberEditor userId="u1" phoneNumber="+15550001111" />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Invalid phone number')).toBeInTheDocument()
  })

  it('saves and refreshes on success', async () => {
    mockUpdate.mockResolvedValue({ ok: true, json: async () => ({}) })
    render(<PhoneNumberEditor userId="u1" phoneNumber="+15550001111" />)

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    fireEvent.change(screen.getByPlaceholderText('+15551234567'), { target: { value: '+15559999999' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith('u1', '+15559999999'))
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled())
  })
})
