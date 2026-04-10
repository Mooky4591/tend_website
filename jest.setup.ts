import '@testing-library/jest-dom'

// Mock next/navigation for all tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock next/font/google so tests don't make network requests
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mock-inter-font',
    style: { fontFamily: 'Inter' },
    variable: '--font-inter',
  }),
}))
