import { QueryClient, QueryFunction } from "@tanstack/react-query";

const friendlyErrorMessages: Array<[RegExp, string]> = [
  [/invalid or inactive code/i, "Check the code for typos or try a currently active coupon."],
  [/this code has expired/i, "This coupon has expired. Try another code."],
  [/this code has reached its usage limit/i, "This coupon has already been used up. Try another code."],
  [/minimum order of \$[\d.]+ required/i, "Add more items to your cart to meet this coupon's minimum order."],
  [/insufficient balance/i, "Your balance is too low for this purchase. Add funds or choose another payment method."],
  [/out of stock|no longer available|insufficient stock/i, "One or more selected items are no longer available. Refresh your cart and try again."],
  [/unauthorized|not authenticated|please sign in/i, "Your session has expired. Please sign in again and retry."],
  [/network|failed to fetch|fetch failed/i, "We couldn't reach the server. Check your connection and try again."],
];

function extractErrorMessage(value: string): string {
  const statusAndBody = value.match(/^\d{3}:\s*([\s\S]*)$/);
  const body = statusAndBody?.[1]?.trim() || value.trim();

  try {
    const parsed = JSON.parse(body);
    if (typeof parsed?.message === "string") return parsed.message;
    if (typeof parsed?.error === "string") return parsed.error;
  } catch {
    // The response was plain text, so use it below.
  }

  return body.replace(/^\d{3}:\s*/, "").trim();
}

export function getFriendlyErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const message = extractErrorMessage(raw);
  if (!message || /^\d{3}$/.test(message) || /^internal server error$/i.test(message)) return fallback;

  const match = friendlyErrorMessages.find(([pattern]) => pattern.test(message));
  return match?.[1] ?? message;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(getFriendlyErrorMessage(`${res.status}: ${text}`));
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
