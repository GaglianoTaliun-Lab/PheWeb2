import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8090
  },
  build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html'),
				home: resolve(__dirname, 'src/pages/home/home.html'),
				phenotypes: resolve(__dirname, 'src/pages/phenotypes/phenotypes.html'),
				random: resolve(__dirname, 'src/pages/random/random.html'),
				tophits: resolve(__dirname, 'src/pages/tophits/tophits.html'),
				about: resolve(__dirname, 'src/pages/about/about.html')
			}
		}
	}
})
