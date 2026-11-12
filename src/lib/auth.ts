import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth-token";

export * from "./auth-token";

export async function getCurrentUser() {
  const jar = await cookies();
  return verifySession(jar.get(SESSION_COOKIE)?.value);
}
