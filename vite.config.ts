import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      plugins: [vue()],
      json: {
        stringify: true
      }
    }
  } else {
    return {
      plugins: [vue()],
      base: "/SongCiApp/",
      json: {
        stringify: true
      }
    }
  }
})
