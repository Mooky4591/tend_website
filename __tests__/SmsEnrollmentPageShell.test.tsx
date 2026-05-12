import { render, screen } from '@testing-library/react'
import SmsEnrollmentPage from '@/app/sms-enrollment/page'

jest.mock('@/components/Navigation', () => {
  const Navigation = () => <nav aria-label="Main navigation" />
  Navigation.displayName = 'Navigation'
  return { __esModule: true, default: Navigation }
})

jest.mock('@/components/Footer', () => {
  const Footer = () => <footer />
  Footer.displayName = 'Footer'
  return { __esModule: true, default: Footer }
})

jest.mock('@/app/sms-enrollment/SmsEnrollmentForm', () => {
  const SmsEnrollmentForm = () => <div data-testid="enrollment-form" />
  SmsEnrollmentForm.displayName = 'SmsEnrollmentForm'
  return { __esModule: true, default: SmsEnrollmentForm }
})

describe('SmsEnrollmentPage shell', () => {
  it('renders the page heading', () => {
    render(<SmsEnrollmentPage />)
    expect(
      screen.getByRole('heading', { name: /Enroll in Tendr SMS Home Warranty Assistance/i, level: 1 })
    ).toBeInTheDocument()
  })

  it('renders within a main landmark', () => {
    render(<SmsEnrollmentPage />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('renders the SmsEnrollmentForm', () => {
    render(<SmsEnrollmentPage />)
    expect(screen.getByTestId('enrollment-form')).toBeInTheDocument()
  })

  it('renders the Navigation', () => {
    render(<SmsEnrollmentPage />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})
