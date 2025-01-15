import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/openai': {
        target: 'https://llm-proxy.sandbox.indeed.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/openai/, '/openai/v1'),
        secure: false,
      },
    },
  },
})

