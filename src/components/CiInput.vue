<template>
<div v-for="(p, i) in paragraphList" :key="i" class="line-input">
  <zi-input v-for="(c, j) in p"
            :key="getIndex(i, j)"
            :ref="el => addInput(el, getIndex(i, j))"
            :index="getIndex(i, j)"
            :status="statusList[getIndex(i, j)]"
            :pu="c"
            v-model:zi="ziList[getIndex(i, j)]"
            @next-input="nextZi"
            @pre-input="preZi"
            @focus-input="onWordSearch"/>
</div>
</template>

<script setup lang="ts">
import ZiInput from "../components/ZiInput.vue"
import { onMounted, reactive, watch, onBeforeUpdate } from "vue"
import { yunService } from "../data/YunService"

const props = defineProps<{
  pu: string
  content: string
  book: number
  strictMode: boolean
}>()

const emit = defineEmits<{
  (e: 'update:content', content: string): void,
  // 更新候选词列表
  (e: 'updateWords', searchChar: string, searchPu: string): void
}>()

// 分段落显示
const paragraphList = reactive(new Array<string>())
onMounted(() => {
  let currentLength = 0;
  for (let s of (props.pu || "").split("|")) {
    currentLength += s.length
    if (s.length > 18) {
      // 找到离中心最近的句号
      let index = Math.floor(s.length / 2)
      for (let i = 0; i < s.length; i++) {
        if (s[index - i] === "。") {
          index = index - i
          break
        }
        if (s[index + i] === "。") {
          index = index + i
          break
        }
      }
      paragraphList.push(s.substring(0, index + 1))
      paragraphList.push(s.substring(index + 1))
    } else {
      paragraphList.push(s)
    }
  }
})
// 获取行列单元格在词谱中的位置索引
const getIndex = (row: number, column: number) => {
  let index = 0
  for (let i = 0; i < row; i++) {
    index += paragraphList[i].length
  }
  return index + column
}
// 每个输入单元的内容
const puText = props.pu.replace("|", "")
const ziList = reactive(new Array<string>(puText.length))
const initZiList = () => {
  for (let i = 0; i < puText.length; i++) {
    if ("，。、".indexOf(puText[i]) != -1) {
      ziList[i] = puText[i]
    } else {
      ziList[i] = ""
    }
  }
}
const statusList = reactive(new Array<number>(puText.length))
const initStatusList = () => {
  for (let i = 0; i < statusList.length; i++) {
    statusList[i] = -1
  }
}
// 韵部索引
const yunIndexMap = new Map<string, Array<number>>()
onMounted(() => {
  let index = 0
  for (let s of props.pu) {
    if ("0123，。、".indexOf(s) === -1) {
      if (! yunIndexMap.has(s)) {
        yunIndexMap.set(s, new Array<number>())
      }
      yunIndexMap.get(s)?.push(index)
    }
    if (s != "|") index ++
  }
})
onMounted(() => {
  initStatusList()
  if (props.content.length == puText.length) {
    for (let i = 0; i < puText.length; i++) {
      ziList[i] = props.content[i] == " " ? "" : props.content[i]
    }
    updateStatusList()
  } else {
    initZiList()
  }
})
// 文本框焦点移动
const inputRefList = reactive([])
onBeforeUpdate(() => {
  inputRefList.length = ziList.length
})
const addInput = (el, index) => {
  if (el) {
    inputRefList[index] = el
  }
}
const nextZi = (index: number) => {
  if (inputRefList[index + 1].allowInput) {
    onWordSearch(index + 1)
    inputRefList[index + 1].focus()
  } else {
    inputRefList[index + 2].focus()
  }
}
const preZi = (index: number) => {
  if (index > 0) {
    if (inputRefList[index - 1].allowInput) {
      onWordSearch(index - 1)
      inputRefList[index - 1].focus()
    } else {
      onWordSearch(index - 2)
      inputRefList[index - 2].focus()
    }
  }
}
// 向父组件发出更新候选词列表事件
const onWordSearch = (index: number) => {
  if (index > 0 && inputRefList[index - 1].allowInput) {
    emit("updateWords", ziList[index - 1], inputRefList[index].pu)
  } else {
    emit("updateWords", "", "")
  }
}
const updateYunStatus = () => {
  let statusMap = new Map<string, Array<number>>()
  yunIndexMap.forEach((v, k) => {
    statusMap.set(k, yunService.checkYun(props.book, k, v.map((index) => (ziList[index]))))
  })
  return statusMap
}
// 格律检查
const updateStatusList = () => {
  ziList.forEach((zi, i) => {
    statusList[i] = yunService.checkPu(zi, props.book, puText[i], props.strictMode)
  })
  updateYunStatus().forEach((v, k) => {
    v.forEach((status, i) => {
      let ziIndex = yunIndexMap.get(k)[i]
      if (statusList[ziIndex] == 0 || status == 0) {
        statusList[ziIndex] = 3
      } else if (statusList[ziIndex] == 2 || status == 2) {
        statusList[ziIndex] = 5
      }
    })
  })
}
// 向父组件更新内容
watch(
    () => [...ziList],
    (newList, oldList) => {
      let result = ""
      newList.forEach((s) => {
        if (s.length == 0) {
          result += " "
        } else {
          result += s
        }
      })
      updateStatusList()
      emit("update:content", result)
    }
)
watch(
    () => props.book,
    (newVal, oldVal) => {
      updateStatusList()
    }
)
watch(
    () => props.strictMode,
    (newVal, oldVal) => {
      updateStatusList()
    }
)
watch(
    () => props.content,
    (newVal, oldVal) => {
      if (newVal.length == 0) {
        initZiList()
        initStatusList()
        inputRefList[0]?.focus()
      }
    }
)
</script>

<style scoped>
.line-input {
  display: flex;
}
</style>