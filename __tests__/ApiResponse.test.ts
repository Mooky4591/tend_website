/**
 * @jest-environment node
 */

import {
  unauthorized,
  forbidden,
  badRequest,
  notFound,
  serverError,
  badGateway,
  unsupportedMedia,
  payloadTooLarge,
  unprocessableEntity,
  ok,
  created,
} from '@/lib/api-response'

describe('api-response — status codes', () => {
  it('unauthorized returns 401', () => { expect(unauthorized().status).toBe(401) })
  it('forbidden returns 403', () => { expect(forbidden('msg').status).toBe(403) })
  it('badRequest returns 400', () => { expect(badRequest('msg').status).toBe(400) })
  it('notFound returns 404', () => { expect(notFound().status).toBe(404) })
  it('serverError returns 500', () => { expect(serverError('msg').status).toBe(500) })
  it('badGateway returns 502', () => { expect(badGateway('msg').status).toBe(502) })
  it('unsupportedMedia returns 415', () => { expect(unsupportedMedia('msg').status).toBe(415) })
  it('payloadTooLarge returns 413', () => { expect(payloadTooLarge('msg').status).toBe(413) })
  it('unprocessableEntity returns 422', () => { expect(unprocessableEntity('msg').status).toBe(422) })
  it('ok returns 200', () => { expect(ok({ result: 1 }).status).toBe(200) })
  it('created returns 201', () => { expect(created({ id: 'x' }).status).toBe(201) })
})

describe('api-response — error bodies', () => {
  it('unauthorized body includes { error }', async () => {
    expect(await unauthorized().json()).toMatchObject({ error: expect.any(String) })
  })

  it('forbidden uses provided message', async () => {
    expect(await forbidden('Not allowed').json()).toEqual({ error: 'Not allowed' })
  })

  it('forbidden uses default message when none provided', async () => {
    expect(await forbidden().json()).toEqual({ error: 'No tenant' })
  })

  it('badRequest uses provided message', async () => {
    expect(await badRequest('bad input').json()).toEqual({ error: 'bad input' })
  })

  it('notFound uses default message when none provided', async () => {
    expect(await notFound().json()).toEqual({ error: 'Not found' })
  })

  it('serverError uses provided message', async () => {
    expect(await serverError('boom').json()).toEqual({ error: 'boom' })
  })

  it('badGateway uses provided message', async () => {
    expect(await badGateway('upstream failed').json()).toEqual({ error: 'upstream failed' })
  })

  it('unsupportedMedia uses provided message', async () => {
    expect(await unsupportedMedia('PDFs only').json()).toEqual({ error: 'PDFs only' })
  })

  it('payloadTooLarge uses provided message', async () => {
    expect(await payloadTooLarge('too big').json()).toEqual({ error: 'too big' })
  })

  it('unprocessableEntity uses provided message', async () => {
    expect(await unprocessableEntity('no text').json()).toEqual({ error: 'no text' })
  })
})

describe('api-response — success bodies', () => {
  it('ok serializes the data argument directly', async () => {
    expect(await ok({ ok: true, count: 3 }).json()).toEqual({ ok: true, count: 3 })
  })

  it('created serializes the data argument directly', async () => {
    expect(await created({ id: 'abc' }).json()).toEqual({ id: 'abc' })
  })
})
