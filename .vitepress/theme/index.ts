import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import HomePage from './components/HomePage.vue'
import Playground from './components/playground/Playground.vue'
import Layout from './Layout.vue'
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
