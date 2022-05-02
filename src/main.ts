import { createApp, defineComponent, h } from 'vue'
import ChooseCiPai from './pages/ChooseCiPai.vue'
import MainPage from './pages/MainPage.vue'

const routes = new Map([
  ['/', ChooseCiPai],
  ['/main', MainPage]
])

const App = defineComponent({
  data: () => ({
    currentRoute: window.location.pathname
  }),

  computed: {
    ViewComponent () {
      return routes.get(this.currentRoute) || ChooseCiPai
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
