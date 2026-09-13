import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves a project site from /<repo>/, so the deploy workflow
// passes BASE_PATH; local dev, preview and custom domains stay at the root.
// Every runtime asset URL is built from import.meta.env.BASE_URL.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [react()],
})
