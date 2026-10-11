import axios from "axios";

interface CacheEntry {
  time: number;
  promise: Promise<any>;
}

const cache = new Map<string, CacheEntry>();

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export function clearCache() {
  cache.clear();
}

export function cachedGet(url: string, ttl = 30000): Promise<any> {
  const key = getToken() + "|" + url;
  const hit = cache.get(key);

  if (hit && Date.now() - hit.time < ttl) {
    return hit.promise;
  }

  const promise = axios
    .get(url, { headers: { Authorization: "Bearer " + getToken() } })
    .then((res) => res.data);

  cache.set(key, { time: Date.now(), promise });

  promise.catch(() => {
    if (cache.get(key)?.promise === promise) cache.delete(key);
  });

  return promise;
}

function isWrite(config: any) {
  const method = String(config?.method || "get").toLowerCase();
  return method !== "get";
}

axios.interceptors.response.use(
  (response) => {
    if (isWrite(response.config)) clearCache();
    return response;
  },
  (error) => {
    if (isWrite(error?.config)) clearCache();
    return Promise.reject(error);
  }
);