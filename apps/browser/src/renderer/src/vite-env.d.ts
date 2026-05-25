/// <reference types="vite/client" />

import type { AiLaunchpadApi } from "../../shared/api";

declare global {
  interface Window {
    aiLaunchpad?: AiLaunchpadApi;
  }
}
