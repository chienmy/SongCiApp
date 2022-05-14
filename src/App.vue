<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <route-view/>
    <div style="text-align: center; padding: 15px;">
      <span>
         助词 2022 · Made by <a href="https://github.com/chienmy/SongCiApp">Chienmy</a>
      </span>
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { GlobalThemeOverrides, NConfigProvider } from "naive-ui"
import { Component, defineComponent, h } from "vue"
import ChoosePage from './pages/ChoosePage.vue'
import MainPage from './pages/MainPage.vue'
import NotFoundPage from './pages/NotFoundPage.vue'

const routes = new Map<string, Component>([
  ['/', ChoosePage],
  ['/main', MainPage]
])
const routeView = defineComponent({
  data: () => ({
    currentRoute: window.location.pathname
  }),

  computed: {
    ViewComponent () {
      return routes.get(this.currentRoute.substring(import.meta.env.BASE_URL.length - 1)) || NotFoundPage
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

const themeOverrides: GlobalThemeOverrides = {
    common: {
      primaryColor: "#207f4c",
      primaryColorHover: "#20a162",
      primaryColorPressed: "#207f4c",
      primaryColorSuppl: "#20a162",
    }
}
</script>

<style scoped>

</style>