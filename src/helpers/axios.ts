import axios, { type AxiosError, type AxiosInstance } from "axios";
import { getApiUrl } from "lib/config";

function getBaseUrl(relativePrefix: string): string {
  if (typeof window === "undefined") {
    try {
      return getApiUrl();
    } catch {
      return relativePrefix;
    }
  }
  return relativePrefix;
}

export const axiosInstanceApi: AxiosInstance = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  },
});

export const axiosInstanceBackend: AxiosInstance = axios.create({
  baseURL: getBaseUrl("/api/backend"),
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  },
});

export const axiosInstancePublic: AxiosInstance = axios.create({
  baseURL: getBaseUrl("/api/public"),
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  },
});


axiosInstancePublic.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    try {
      config.baseURL = getApiUrl();
    } catch {
      // fallback
    }
  }
  return config;
});

axiosInstanceBackend.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    try {
      config.baseURL = getApiUrl();
    } catch {
      // fallback
    }
  }
  return config;
});

function isRetryableAuthError(error: AxiosError): boolean {
  const status = error.response?.status;
  return status === 401;
}

type RetriableAxiosConfig = NonNullable<AxiosError["config"]> & {
  _retry?: boolean;
  skipAuthRedirect?: boolean;
};

let refreshPromise: Promise<unknown> | null = null;

function performTokenRefresh(): Promise<unknown> {
  if (!refreshPromise) {
    refreshPromise = axiosInstanceApi
      .post("/api/auth/refresh", null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function setupAxiosInterceptors() {
  if (typeof window === "undefined") return;
  const anyAxios = axiosInstanceApi as unknown as { __psInterceptorsSetup?: boolean };
  if (anyAxios.__psInterceptorsSetup) return;
  anyAxios.__psInterceptorsSetup = true;

  const handleInterceptorError = async (
    error: AxiosError,
    clientInstance: AxiosInstance
  ) => {
    const original = error.config as RetriableAxiosConfig | undefined;
    if (!original) return Promise.reject(error);

    if (!isRetryableAuthError(error)) return Promise.reject(error);

    // Prevent infinite loop: if the error comes from the refresh endpoint itself, do not retry.
    if (original.url?.includes("/auth/refresh")) return Promise.reject(error);

    if (original._retry) return Promise.reject(error);
    original._retry = true;

    try {
      await performTokenRefresh();
      return clientInstance.request(original);
    } catch (refreshErr) {
      if (original.skipAuthRedirect) {
        return Promise.resolve({
          data: null,
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config: original,
        });
      }
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/auth/login";
      return Promise.reject(refreshErr);
    }
  };

  axiosInstanceApi.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => handleInterceptorError(error, axiosInstanceApi)
  );

  axiosInstanceBackend.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => handleInterceptorError(error, axiosInstanceBackend)
  );
}
