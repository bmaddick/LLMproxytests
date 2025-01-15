import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  base: '/AI4I testing/',  // Base URL for Internal Hub deployment
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/bedrock': {
        target: 'https://llm-proxy.sandbox.indeed.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bedrock/, '/bedrock'),
        secure: false,
        headers: {
          'Origin': 'http://localhost:5173',
          'Referer': 'http://localhost:5173/',
        },
      },
    },
  },
})

