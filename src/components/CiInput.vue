<template>
<div v-for="(p, i) in paragraphList" :key="i" class="line-input">
  <zi-input v-for="(c, j) in p"
            :ref="el => addInput(el, getIndex(i, j))"
            :pu="c"
            :index="getIndex(i, j)"
            v-model:zi="ziList[getIndex(i, j)]"
            @next-input="nextZi"
            @pre-input="preZi"
            @focus-input="onWordSearch"/>
</div>
</template>

<script setup lang="ts">
import ZiInput from '../components/ZiInput.vue'
import {onMounted, ref, reactive, computed, watch, onBeforeUpdate, unref, watchPostEffect} from "vue"
import allZiYun from "../data/ziYun"
import {getPingZe, unzipZiYun} from "../data/utils"
import {Yun} from "./model";

const props = defineProps<{
  pu: string,
  content: string,
  book: string
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
const ziList = reactive(new Array<string>())
onMounted(() => {
  for (let s of props.pu || "") {
    if (s != "|") {
      if ("，。、".indexOf(s) != -1) {
        ziList.push(s)
      } else {
        ziList.push("")
      }
    }
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
const updateYunStatus = () => {
  let statusMap = new Map<string, Array<number>>()
  yunIndexMap.forEach((v, k) => {
    let result = new Array<number>(v.length)
    let possibleYun = new Array<Set<string>>()
    v.forEach((index) => {
      let innerSet = new Set<string>()
      if (ziList[index].length != 0) {
        allZiYun.get(props.book + ziList[index]).forEach((yun) => {
          innerSet.add(unzipZiYun(yun).part)
        })
        possibleYun.push(innerSet)
      }
    })
    if (possibleYun.length == 1) {
      v.forEach((index, i) => {
        result[i] = (ziList[index].length != 0 ? 1 : -1)
      })
    } else if (possibleYun.length > 1) {
      let joinSet = new Set<string>([...possibleYun[0]])
      for (let i = 1; i < possibleYun.length; i++) {
        joinSet = new Set<string>([...joinSet].filter((item) => possibleYun[i].has(item)))
      }
      if (joinSet.size == 0) {
        v.forEach((index, i) => {
          result[i] = (ziList[index].length != 0 ? 0 : -1)
        })
      } else {
        v.forEach((index, i) => {
          result[i] = (ziList[index].length != 0 ? (allZiYun.get(props.book + ziList[index]).length == 1 ? 1 : 2) : -1)
        })
      }
    }
    statusMap.set(k, result)
  })
  return statusMap
}
// 格律检查
const updateStatusList = () => {
  inputRefList.forEach((r) => {
    if (r.allowInput) {
      let puFlag = r.pu
      if (props.strictMode) {
        if (puFlag == "2") puFlag = "0"
        if (puFlag == "3") puFlag = "1"
      }
      if (r.zi == "") {
        r.status = -1
      } else if (puFlag == "2" || puFlag == "3") {
        r.status = 1
      } else {
        let truth = getPingZe(r.zi, props.book)
        if (truth == -1 || truth == 2) {
          r.status = truth
        } else if (puFlag == "0" || /[a-z]/.test(puFlag)) {
          r.status = truth == 0 ? 1 : 0
        } else if (puFlag == "1" || /[A-Z]/.test(puFlag)) {
          r.status = truth == 1 ? 1 : 0
        }
      }
    }
  })
  updateYunStatus().forEach((v, k) => {
    v.forEach((status, i) => {
      let ziInput = inputRefList[yunIndexMap.get(k)[i]]
      if (ziInput.status == 0 || status == 0) {
        ziInput.status = 3
      } else if (ziInput.status == 2 || status == 2) {
        ziInput.status = 5
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

</script>

<style scoped>
.line-input {
  display: flex;
}
</style>