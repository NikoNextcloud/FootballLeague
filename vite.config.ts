import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' -> относителни пътища, работи и на GitHub Pages (user.github.io/repo/)
// и в локален preview, без нужда да се сменя ръчно.
export default defineConfig({
  plugins: [react()],
  base: './',
})
