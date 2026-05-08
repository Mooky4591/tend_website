import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import PhoneNumberEditor from '@/app/dashboard/users/[id]/PhoneNumberEditor'

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
