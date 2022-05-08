import { createApp, defineComponent, h } from 'vue'
import ChoosePage from './pages/ChoosePage.vue'
import MainPage from './pages/MainPage.vue'

const routes = new Map<string, any>([
  ['/', ChoosePage],
  ['/main', MainPage]
])

const App = defineComponent({
  data: () => ({
    currentRoute: window.location.pathname
  }),

  computed: {
    ViewComponent () {
      return routes.get(this.currentRoute) || ChoosePage
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
