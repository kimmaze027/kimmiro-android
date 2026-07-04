import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kimmiro.app",
  appName: "김미로",
  webDir: "www",
  server: {
    androidScheme: "https",
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "117055947609-ddekaas8131nata3eh8a94urahuh01ja.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
