import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;
  const isApiRoute = pathname.startsWith("/api/");

  const unauthorizedResponse = () => {
    if (isApiRoute) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  };

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    verifySessionToken(token);
  } catch {
    const response = isApiRoute
      ? NextResponse.json({ error: "Invalid token" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/me", "/api/users/:path*", "/chat/:path*"]
}
