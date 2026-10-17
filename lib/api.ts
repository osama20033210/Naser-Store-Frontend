import type { ApiErrorBody } from "@/lib/types";

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;
let refreshPromise: Promise<boolean> | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: ApiErrorBody,
  ) {
    super(body.message ?? `Request failed (${status})`);
  }
}

async function parse(response: Response) {
  if (response.status === 204) return undefined;
  const type = response.headers.get("content-type") ?? "";
  return type.includes("json")
    ? response.json()
    : { message: "The API is unavailable. Please try again." };
}

export async function ensureCsrf(force = false): Promise<string> {
  if (force) csrfToken = null;
  if (csrfToken && !force) return csrfToken;
  if (!csrfPromise)
    csrfPromise = fetch("/api/v1/auth/csrf", {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const body = await parse(response);
        if (!response.ok || !body?.csrf_token)
          throw new ApiError(response.status, body ?? {});
        csrfToken = body.csrf_token;
        return csrfToken!;
      })
      .finally(() => {
        csrfPromise = null;
      });
  return csrfPromise;
}

async function raw(path: string, options: RequestInit = {}) {
  const method = (options.method ?? "GET").toUpperCase();
  const unsafe = !["GET", "HEAD", "OPTIONS"].includes(method);
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (unsafe) headers.set("X-CSRF-TOKEN", await ensureCsrf());
  return fetch(`/api/v1${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });
}

/** Coordinate cookie rotation with sign-in/out across tabs where Web Locks are available. */
async function withAuthLock<T>(callback: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks)
    return navigator.locks.request("naser-store-auth", callback);
  return callback();
}

async function refresh(): Promise<boolean> {
  if (!refreshPromise)
    refreshPromise = withAuthLock(async () => {
      // Another tab may have rotated the cookie while this request waited for the lock.
      const current = await raw("/auth/me", {signal: AbortSignal.timeout(15000)});
      if (current.ok) return true;
      if (current.status !== 401)
        throw new ApiError(current.status, (await parse(current)) ?? {});
      let response = await raw("/auth/refresh", {method: "POST", signal: AbortSignal.timeout(15000)});
      if (response.status === 419) {
        await ensureCsrf(true);
        response = await raw("/auth/refresh", {method: "POST", signal: AbortSignal.timeout(15000)});
      }
      if (response.status === 401) return false;
      if (!response.ok)
        throw new ApiError(response.status, (await parse(response)) ?? {});
      return true;
    })
      .finally(() => {
        refreshPromise = null;
      });
  return refreshPromise;
}

/** Cookie JWT client: tokens remain unreadable to JavaScript; only the CSRF value is held in memory. */
export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const request = async () => {
    let response = await raw(path, options);
    if (response.status === 419 && retry) {
      await ensureCsrf(true);
      response = await raw(path, options);
    }
    return response;
  };
  let response = ["/auth/login", "/auth/register", "/auth/logout"].includes(path)
    ? await withAuthLock(request)
    : await request();
  const authPath =
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/logout");
  if (response.status === 401 && retry && !authPath && (await refresh()))
    response = await raw(path, options);
  const body = await parse(response);
  if (!response.ok) {
    if (response.status === 401 && !authPath)
      window.dispatchEvent(new Event("auth:expired"));
    if (response.status === 419) csrfToken = null;
    throw new ApiError(response.status, body ?? {});
  }
  return body as T;
}

export function clearClientAuth() {
  csrfToken = null;
}
