import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kimmiro.app",
  appName: "김미로",
  webDir: "www",
  server: {
    androidScheme: "https",
  },
};

export default config;
