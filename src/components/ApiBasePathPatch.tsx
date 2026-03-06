"use client";

import { useEffect } from "react";

const BASE_PATH = "/eqinfo";

export default function ApiBasePathPatch() {
  useEffect(() => {
    const nativeFetch = window.fetch.bind(window);

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string" && input.startsWith("/api/")) {
        return nativeFetch(`${BASE_PATH}${input}`, init);
      }

      if (input instanceof URL && input.origin === window.location.origin && input.pathname.startsWith("/api/")) {
        const url = new URL(input.toString());
        url.pathname = `${BASE_PATH}${url.pathname}`;
        return nativeFetch(url, init);
      }

      return nativeFetch(input, init);
    }) as typeof window.fetch;
  }, []);

  return null;
}
