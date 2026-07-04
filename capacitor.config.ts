import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kimmiro.app",
  appName: "김미로",
  webDir: "www",
  server: {
    url: "https://www.kimmiro.com",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
