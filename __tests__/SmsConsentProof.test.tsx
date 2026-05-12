import { render, screen } from '@testing-library/react'
import SmsConsentProofPage from '@/app/sms-consent-proof/page'

describe('SmsConsentProofPage', () => {
  it('renders the SMS Consent Flow heading', () => {
    render(<SmsConsentProofPage />)
    expect(screen.getByRole('heading', { name: 'Tendr SMS Consent Flow', level: 1 })).toBeInTheDocument()
  })

  it('renders within a main landmark', () => {
    render(<SmsConsentProofPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the consent disclosure text', () => {
    render(<SmsConsentProofPage />)
    expect(screen.getByText(/By checking this box, I agree to receive SMS messages from Tendr/)).toBeInTheDocument()
  })

  it('renders the enrollment form mockup', () => {
    render(<SmsConsentProofPage />)
    expect(screen.getByRole('form', { name: /tendr sms enrollment form mockup/i })).toBeInTheDocument()
  })
})
