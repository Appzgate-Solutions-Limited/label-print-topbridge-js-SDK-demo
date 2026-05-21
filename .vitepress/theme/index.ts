import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import HomePage from './components/HomePage.vue'
import Playground from './components/playground/Playground.vue'
import './styles/variables.css'
import './styles/animations.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('Playground', Playground)
  },
} satisfies Theme
