<template>
  <n-grid :cols="12" item-responsive>
    <n-grid-item span="12 1200:10 1500:8" offset="0 1200:1 1500:2">
      <n-card style="text-align: center">
        <h1>当前页面不存在</h1>
        <h2>「众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。」</h2>
        <n-button size="large" type="success" @click="returnBack">返回首页</n-button>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import {
  NButton,
  NCard,
  NGrid,
  NGridItem,
} from 'naive-ui'

const returnBack = () => {
  window.location.href = '/'
}
</script>

<style scoped>

</style>