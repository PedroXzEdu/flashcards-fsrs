const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

const REQUEST_TIMEOUT = 15000;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ error: "Erro desconhecido" }));

      throw new Error(error.error || "Erro na requisição");
    }

    if (res.status === 204) {
      return null as T;
    }

    const json = await res.json();

    return json.data as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("O servidor não respondeu. Verifique sua conexão.", { cause: err });
    }
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      throw new Error("Sem conexão com o servidor. Verifique sua conexão.", { cause: err });
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};
