/**
 * @jest-environment node
 *
 * next/og's ImageResponse uses Web Streams APIs that don't exist in jsdom.
 * The node environment provides them natively.
 */

let constructorArgs: { element: unknown; options: unknown } | null = null

jest.mock('next/og', () => ({
  // ImageResponse from next/og normally returns a Response.
  // For coverage purposes we only need to capture what was passed to it.
  ImageResponse: jest.fn().mockImplementation((element: unknown, options: unknown) => {
    constructorArgs = { element, options }
    return { __mock: 'image-response' }
  }),
}))

import OGImage, { alt, size, contentType, runtime } from '@/app/opengraph-image'

beforeEach(() => {
  constructorArgs = null
})

describe('opengraph-image module exports', () => {
  it('runs on the edge runtime', () => {
    expect(runtime).toBe('edge')
  })

  it('exports a non-empty alt string', () => {
    expect(typeof alt).toBe('string')
    expect(alt.length).toBeGreaterThan(0)
  })

  it('declares the standard 1200x630 OG image size', () => {
    expect(size).toEqual({ width: 1200, height: 630 })
  })

  it('declares image/png content type', () => {
    expect(contentType).toBe('image/png')
  })
})

describe('OGImage()', () => {
  it('constructs an ImageResponse without throwing', () => {
    expect(() => OGImage()).not.toThrow()
  })

  it('passes the declared size as the second argument to ImageResponse', () => {
    OGImage()
    expect(constructorArgs?.options).toMatchObject({ width: 1200, height: 630 })
  })

  it('renders the Tendr brand name in the produced element tree', () => {
    OGImage()
    // The first argument is a React element tree — recursively check its text content
    function collectText(node: unknown): string {
      if (node == null) return ''
      if (typeof node === 'string') return node
      if (typeof node === 'number') return String(node)
      if (Array.isArray(node)) return node.map(collectText).join(' ')
      if (typeof node === 'object' && 'props' in (node as Record<string, unknown>)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const children = (node as any).props?.children
        return collectText(children)
      }
      return ''
    }
    const text = collectText(constructorArgs?.element)
    expect(text).toContain('Tendr')
    expect(text).toContain('AI Home Assistant Platform')
    expect(text).toContain('SMS-NATIVE')
  })
})
