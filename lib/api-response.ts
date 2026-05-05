import { NextResponse } from 'next/server'

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export function forbidden(message = 'No tenant') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function serverError(message: string) {
  return NextResponse.json({ error: message }, { status: 500 })
}

export function badGateway(message: string) {
  return NextResponse.json({ error: message }, { status: 502 })
}

export function unsupportedMedia(message: string) {
  return NextResponse.json({ error: message }, { status: 415 })
}

export function payloadTooLarge(message: string) {
  return NextResponse.json({ error: message }, { status: 413 })
}

export function unprocessableEntity(message: string) {
  return NextResponse.json({ error: message }, { status: 422 })
}

export function ok<T extends object>(data: T) {
  return NextResponse.json(data)
}

export function created<T extends object>(data: T) {
  return NextResponse.json(data, { status: 201 })
}
