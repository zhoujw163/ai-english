import type { App } from 'vue'
import focus from './focus'

export default function registerDirectives(app: App) {
    app.use(focus)
}
