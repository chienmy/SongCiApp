<template>
<n-modal v-model:show="show" @update:show="(v) => update(v)">
  <n-card
      id="card"
      size="huge"
      role="dialog"
      aria-modal="true"
      content-style="padding-top: 10px"
  >
    <n-divider class="my-divider">
      词谱
    </n-divider>
    <div style="font-size: 16px">
      平仄确定：<span class="pu-symbol">◯</span> - 平声；<span class="pu-symbol">●</span> - 仄声
      <br/>
      平仄皆可：<span class="pu-symbol">◎</span> - 平声优先；<span class="pu-symbol">◉</span> - 仄声优先
      <br/>
      韵字：<span class="pu-symbol">①</span> - 平声；<span class="pu-symbol">❶</span> - 仄声 （相同数字表示同一韵部）
    </div>
    <n-divider class="my-divider">
      声韵
    </n-divider>
    <div style="font-size: 16px">
      校验结果：
      <span class="pu-symbol" style="color: #207f4c">●</span> - 正确；
      <span class="pu-symbol" style="color: #d9a40e">●</span> - 多音字需自行判断；
      <span class="pu-symbol" style="color: #c21f30">●</span> - 错误
      <br/>
      （韵部校验结果会显示为背景高亮）
      <br/>
      严格模式：开启后平仄皆可的字校验时会严格按照优先的平仄
    </div>
    <n-divider class="my-divider">
      组词
    </n-divider>
    <div style="font-size: 16px">
    显示首字为输入字的词组候选列表，按出现次数排序。
    第二字的颜色表示平仄校验结果，含义与上文相同。
    最多显示20项结果。
    </div>
  </n-card>
</n-modal>
</template>

<script setup lang="ts">
import { NCard, NDivider, NModal } from "naive-ui"

const props = defineProps<{
  show
}>()

const emit = defineEmits<{
  (e: 'update:show', status: boolean): void
}>()

const update = (s: boolean) => {
  emit("update:show", s)
}
</script>

<style scoped>
@font-face {
  font-family: "CiPuSymbol";
  src: url("../assets/CiPuSymbol.ttf");
}

#card {
  width: 600px;
}

.my-divider {
  margin-top: 12px;
  margin-bottom: 12px;
  font-size: 20px;
}

.pu-symbol {
  font-family: "CiPuSymbol";
}
</style>