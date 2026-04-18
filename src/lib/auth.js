import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function getJwtSecret() {
  return process.env.JWT_SECRET || "SECRET_KEY";
}

export function signSessionToken(payload, options = {}) {
  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifySessionToken(token) {
  return jwt.verify(token, getJwtSecret());
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
