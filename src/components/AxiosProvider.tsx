"use client";

import { setupAxiosInterceptors } from "helpers/axios";
import { useEffect } from "react";

export function AxiosProvider() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return null;
}
