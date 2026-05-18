import { render } from '@testing-library/react'
import type { Metadata } from 'next'
import RootLayout, { metadata } from '@/app/layout'

// next/font/google is already mocked globally in jest.setup.ts
// next/navigation is already mocked globally in jest.setup.ts

describe('RootLayout metadata', () => {
  it('exposes the Tendr title', () => {
    expect(metadata.title).toBe('Tendr — AI Home Assistant Platform')
  })

  it('exposes a non-empty description', () => {
    expect(typeof metadata.description).toBe('string')
    expect((metadata.description as string).length).toBeGreaterThan(0)
  })

  it('falls back to https://trytendr.org when NEXT_PUBLIC_SITE_URL is unset', () => {
    // metadata is evaluated at module load time, so a CI- or shell-injected
    // NEXT_PUBLIC_SITE_URL would silently break the cached top-of-file import.
    // Re-import the module in isolation with the env var explicitly unset so
    // this assertion exercises the fallback branch deterministically.
    const originalUrl = process.env.NEXT_PUBLIC_SITE_URL
    delete process.env.NEXT_PUBLIC_SITE_URL
    try {
      let isolated: Metadata | undefined
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        isolated = require('@/app/layout').metadata as Metadata
      })
      expect(isolated?.metadataBase?.toString()).toBe('https://trytendr.org/')
    } finally {
      if (originalUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = originalUrl
      }
    }
  })

  it('honors NEXT_PUBLIC_SITE_URL when it is set', () => {
    const originalUrl = process.env.NEXT_PUBLIC_SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = 'https://preview.example.com'
    try {
      let isolated: Metadata | undefined
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        isolated = require('@/app/layout').metadata as Metadata
      })
      expect(isolated?.metadataBase?.toString()).toBe('https://preview.example.com/')
    } finally {
      if (originalUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = originalUrl
      }
    }
  })

  it('exposes openGraph fields used by the link preview card', () => {
    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph?.title).toBe('Tendr — AI Home Assistant Platform')
    expect((metadata.openGraph as { type?: string } | undefined)?.type).toBe('website')
  })

  it('exposes the impact-site-verification token', () => {
    const other = metadata.other as Record<string, string> | undefined
    expect(other?.['impact-site-verification']).toBe('73a2c675-91d2-4d59-8123-5d237c941dfa')
  })
})

describe('RootLayout component', () => {
  // Rendering <html><body> inside jsdom's existing <html><body> works because
  // jsdom is permissive — the assertions below inspect the produced markup.

  it('renders children inside the body', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="page-content">Hello</div>
      </RootLayout>
    )
    expect(container.querySelector('[data-testid="page-content"]')).toBeInTheDocument()
  })

  it('renders an html element with lang="en" and scroll-smooth class', () => {
    const { container } = render(
      <RootLayout>
        <span />
      </RootLayout>
    )
    const html = container.querySelector('html')
    expect(html).not.toBeNull()
    expect(html?.getAttribute('lang')).toBe('en')
    expect(html?.className).toContain('scroll-smooth')
  })

  it('applies the Inter font className to the body', () => {
    const { container } = render(
      <RootLayout>
        <span />
      </RootLayout>
    )
    const body = container.querySelector('body')
    expect(body?.className).toContain('mock-inter-font')
  })
})
