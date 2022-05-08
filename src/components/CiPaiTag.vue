<template>
  <n-button strong secondary @click="clickTag(tagName)">{{ tagName }}</n-button>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui"

const props = defineProps<{
  tagName: string
}>()

const emit = defineEmits<{
  (e: 'click', tagName: string): void
}>()

const clickTag = (tagName: string) => {
  emit("click", tagName)
}
</script>

<style scoped>

</style>