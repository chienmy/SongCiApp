<template>
  <div class="zi-input">
    <span :style="getPuStyle()">{{ getPuSymbol() }} </span>
    <div :style="getInputStyle()" class="content-input">
      <n-input v-model:value="zi"
               ref="inputRef"
               :disabled="! allowInput"
               @input="updateText"
               @focus="focusEvent"
               @keydown.delete="deleteEvent"
               maxlength="1" type="text" placeholder=""/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NInput } from "naive-ui"
import { InputInst } from 'naive-ui'
import { ref, reactive, onMounted, computed, StyleValue } from "vue"

const props = defineProps<{
  cellHeight?: number,
  cellWidth?: number,
  pu: string,
  index: number,
  zi: string
}>()

const emit = defineEmits<{
  (e: 'update:zi', newText: string): void,
  // 焦点移动到下一个字
  (e: 'nextInput', index: number): void,
  // 焦点移动到当前字
  (e: 'focusInput', index: number): void,
  // 焦点移动到前一个字
  (e: 'preInput', index: number): void
}>()

// 单元大小
const cellHeight = ref(0)
const cellWidth = ref(0)
const cellMargin = ref(2)
onMounted(() => {
  cellHeight.value = props.cellHeight || 28
  cellWidth.value = props.cellWidth || 28
})
// 当前状态
const status = ref(-1)
// 返回css样式
const getPuStyle = (): StyleValue => {
  // 设置颜色
  let colorList = ["black", "#c21f30", "#1a6840", "#d9a40e", "#c21f3033", "", "#d9a40e33"]
  return {
    width: cellWidth.value + 'pt',
    textAlign: 'center',
    fontFamily: "CiPuSymbol",
    fontSize: '16pt',
    color: colorList[status.value >= 2 ? status.value - 2: status.value + 1],
    paddingTop: '3pt',
    backgroundColor: status.value >= 2 ? colorList[status.value + 1] : "none",
  }
}
const getInputStyle = (): StyleValue => {
  return {
    width: (cellWidth.value - cellMargin.value * 2) + 'pt',
    margin: cellMargin.value + 'pt',
    textAlign: 'center',
  }
}
// 词谱转换为符号
const getPuSymbol = () => {
  if (props.pu == "0") {
    return "◯"
  } else if (props.pu == "1") {
    return "●"
  } else if (props.pu == "2") {
    return "◎"
  } else if (props.pu == "3") {
    return "◉"
  } else {
    let pingYun = "①②③④⑤⑥⑦⑧⑨⑩"
    let zeYun = "❶❷❸❹❺❻❼❽❾❿"
    let index = props.pu.charCodeAt(0) - "a".charCodeAt(0)
    if ((index >= 0) && (index < 26)) {
      return pingYun.charAt(index)
    }
    index = props.pu.charCodeAt(0) - "A".charCodeAt(0)
    if ((index >= 0) && (index < 26)) {
      return zeYun.charAt(index)
    }
  }
  return props.pu
}
// 单元可用状态
const allowInput = ref(true)
onMounted(() => {
  allowInput.value = "，。、".indexOf(props.pu) == -1
})
// 更新事件
const pu = ref("")
const zi = ref("")
onMounted(() => {
  zi.value = props.zi
  pu.value = props.pu
})
const updateText = () => {
  emit("update:zi", zi.value)
  if (zi.value.length > 0) {
    emit("nextInput", props.index)
  }
}
const deleteEvent = () => {
  if (zi.value.length == 0) {
    emit("preInput", props.index)
  }
}
const focusEvent = () => {
  emit("focusInput", props.index)
}
// 文本框控制
const inputRef = ref<InputInst | null>(null)
const focus = () => {
  inputRef.value?.focus()
}

defineExpose({
  pu,
  zi,
  status,
  allowInput,
  focus
})
</script>

<style>
@font-face {
  font-family: "CiPuSymbol";
  src: url("../assets/CiPuSymbol.ttf");
}

.zi-input {
  display: flex;
  flex-flow: column;
}

.content-input .n-input-wrapper {
  padding-left: 0;
  padding-right: 0;
  height: 24pt
}
</style>