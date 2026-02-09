import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { CONFIG } from '@en/config'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vite.dev/config/
export default defineConfig({
    server: {
        port: CONFIG.ports.web,
        proxy: {
            '/api': {
                target: `http://localhost:${CONFIG.ports.server}`,
                changeOrigin: true
                // rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    plugins: [
        vue(),
        vueJsx(),
        vueDevTools(),
        tailwindcss(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
            imports: ['vue', 'vue-router', 'pinia'],
            dts: 'auto-imports.d.ts'
        }),
        Components({
            resolvers: [ElementPlusResolver()],
            dts: 'components.d.ts'
        }),
        ElementPlus({
            useSource: true
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
