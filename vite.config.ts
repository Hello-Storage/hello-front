import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {viteBase} from './src/constants.ts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: `${viteBase}`
})
