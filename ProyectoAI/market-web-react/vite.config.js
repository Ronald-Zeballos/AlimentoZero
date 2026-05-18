import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/market-api": {
        target: "http://localhost:8092",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/market-api/, "/api/v1/market")
      },
      "/ai-api": {
        target: "http://localhost:8091",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-api/, "/api/v1/ai")
      },
      "/iam-api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/iam-api/, "/api/v1/iam")
      }
    }
  }
});
