import {Component, createApp, defineComponent, h} from 'vue'
import ChoosePage from './pages/ChoosePage.vue'
import MainPage from './pages/MainPage.vue'
import NotFoundPage from './pages/NotFoundPage.vue'

const routes = new Map<string, Component>([
  ['/', ChoosePage],
  ['/main', MainPage]
])

const App = defineComponent({
  data: () => ({
    currentRoute: window.location.pathname
  }),

  computed: {
    ViewComponent () {
      return routes.get(this.currentRoute) || NotFoundPage
    }
  },

  render () {
    return h(this.ViewComponent)
  },

  created () {
    window.addEventListener('popstate', () => {
      this.currentRoute = window.location.pathname
    })
  }
})

createApp(App).mount('#app')
