import { NextResponse } from 'next/server'

export function proxy(request) {
  let hascookie = request.cookies.has('token');
  //  console.log("Cookie found:", hascookie); //DEBUG
  if (!hascookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: 
  [
    '/',
    '/api/me',
    '/chat/:path*'
  ]
}