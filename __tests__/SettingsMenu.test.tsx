import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsMenu from '@/app/dashboard/SettingsMenu'

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

describe('SettingsMenu', () => {
  it('renders a Settings button', () => {
    render(<SettingsMenu />)
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  it('dropdown is not visible initially', () => {
    render(<SettingsMenu />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('clicking Settings opens the dropdown', async () => {
    const user = userEvent.setup()
    render(<SettingsMenu />)

    await user.click(screen.getByRole('button', { name: 'Settings' }))

    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('Change password link is visible when dropdown is open', async () => {
    const user = userEvent.setup()
    render(<SettingsMenu />)

    await user.click(screen.getByRole('button', { name: 'Settings' }))

    expect(screen.getByRole('menuitem', { name: 'Change password' })).toBeInTheDocument()
  })

  it('Change password link points to /dashboard/settings/change-password', async () => {
    const user = userEvent.setup()
    render(<SettingsMenu />)

    await user.click(screen.getByRole('button', { name: 'Settings' }))

    expect(screen.getByRole('menuitem', { name: 'Change password' })).toHaveAttribute(
      'href',
      '/dashboard/settings/change-password'
    )
  })

  it('clicking a menu item closes the dropdown', async () => {
    const user = userEvent.setup()
    render(<SettingsMenu />)

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    await user.click(screen.getByRole('menuitem', { name: 'Change password' }))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('clicking outside the menu closes the dropdown', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <SettingsMenu />
        <div data-testid="outside">outside</div>
      </div>
    )

    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    await user.click(screen.getByTestId('outside'))
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('button has aria-expanded="false" when closed', () => {
    render(<SettingsMenu />)
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('button has aria-expanded="true" when open', async () => {
    const user = userEvent.setup()
    render(<SettingsMenu />)

    await user.click(screen.getByRole('button', { name: 'Settings' }))

    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true')
  })
})
