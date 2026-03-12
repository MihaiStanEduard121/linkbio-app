export const TOKEN_KEY = "linkbio_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// Helper to inject the auth token into Orval generated hooks
export function useApiAuth() {
  const token = getToken();
  return {
    request: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  };
}
