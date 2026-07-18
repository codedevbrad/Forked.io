import type { CookiesOptions } from "next-auth";

const PREFIX = process.env.AUTH_COOKIE_PREFIX ?? "forkedio";
const isProduction = process.env.NODE_ENV === "production";

function cookieName(base: string): string {
  return isProduction ? `__Secure-${PREFIX}.${base}` : `${PREFIX}.${base}`;
}

export function getAuthCookies(): Partial<CookiesOptions> {
  const secure = isProduction;

  return {
    sessionToken: {
      name: cookieName("authjs.session-token"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure,
      },
    },
    csrfToken: {
      name: cookieName("authjs.csrf-token"),
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure,
      },
    },
    callbackUrl: {
      name: cookieName("authjs.callback-url"),
      options: {
        sameSite: "lax",
        path: "/",
        secure,
      },
    },
  };
}
