<template>
  <n-grid :cols="12" item-responsive>
    <n-grid-item span="12 1200:10 1500:8" offset="0 1200:1 1500:2">
      <n-card>
        <n-grid cols="4" x-gap="10" :collapsed-rows="2" item-responsive>
          <n-grid-item span="4 900:1">
            <h1>作词 - {{ ciPaiName }}</h1>
          </n-grid-item>
          <n-grid-item span="4 900:3" style="display: flex; justify-content: flex-end; align-items: center">
            <n-space align="center">
              <n-button ghost color="#207f4c" @click="showModal = true">
                说明
              </n-button>
              <n-button ghost color="#207f4c" @click="copyContent()">
                复制
              </n-button>
              <n-button ghost color="#c21f30" @click="clearContent()">
                清空
              </n-button>
              <n-button ghost color="#c21f30" @click="returnBack()">
                返回
              </n-button>
            </n-space>
            <ci-modal v-model:show="showModal"/>
          </n-grid-item>
        </n-grid>
        <n-grid cols="1">
          <n-grid-item span="1" style="display: flex; justify-content: flex-start; align-items: center; margin-bottom: 10px">
            <n-radio-group v-model:value="yunBook" name="radioGroup">
              <n-space align="center">
                <n-tag type="success">
                  声韵
                </n-tag>
                <n-radio v-for="item in yunBookList" :key="item.value" :value="item.value" size="large">
                  {{ item.label }}
                </n-radio>
                <n-switch v-model:value="strictMode"/>
                <span>严格模式</span>
              </n-space>
            </n-radio-group>
          </n-grid-item>
        </n-grid>
        <n-grid cols="1">
          <n-grid-item span="1" style="display: flex; justify-content: flex-start; align-items: center; margin-bottom: 10px">
            <n-space align="center">
              <n-tag type="success">
                组词
              </n-tag>
              <n-switch v-model:value="wordListStatus" />
              <span>候选提示</span>
            </n-space>
          </n-grid-item>
        </n-grid>
        <n-grid cols="4" :x-gap="20">
          <n-grid-item :span="wordListStatus ? 3 : 4">
            <n-tabs v-model:value="ciPuTab" type="line" @update:value="updateTab" animated>
              <n-tab-pane v-for="(ciPuId, i) in ciPuIdList"
                          :name="ciPuId"
                          :tab="ciPuMap.get(ciPuId).author"
                          display-directive="show:lazy">
                <p>{{ ciPuMap.get(ciPuId).description }}</p>
                <ci-input :pu="ciPuMap.get(ciPuId).content"
                          :book="yunBook"
                          :strict-mode="strictMode"
                          :content="contentMap.get(ciPuId) || ''"
                          @update-words="updateWordList"
                          @update:content="updateHandle"/>
              </n-tab-pane>
            </n-tabs>
          </n-grid-item>
          <n-grid-item :span="wordListStatus ? 1 : 0">
            <n-tabs value="word" type="line">
              <n-tab-pane name="word" tab="候选词" style="text-align: center">
                <n-list v-if="wordList.length > 0" bordered>
                  <n-list-item v-for="item in wordList" style="padding: 6px 10px">
                    <span>{{ item.word[0] }}</span>
                    <span :style="'color: ' + (item.needCheck ? 'darkorange' : 'green')">{{ item.word[1] }}</span>
                    <n-tag size="small" round>{{ item.count }}</n-tag>
                  </n-list-item>
                </n-list>
                <span v-if="wordList.length === 0">暂无</span>
              </n-tab-pane>
              <!--              <n-tab-pane name="nextZi" tab="下一字" style="text-align: center">-->
              <!--              </n-tab-pane>-->
            </n-tabs>
          </n-grid-item>
        </n-grid>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import { NButton, NCard, NGrid, NGridItem, NList, NListItem, NTabs, NTabPane, NTag, NSpace, NRadioGroup, NRadio, NSwitch, useMessage } from "naive-ui"
import { onMounted, ref, reactive } from "vue"
import CiInput from "../components/CiInput.vue"
import CiModal from "../components/CiModal.vue"
import { CiPu, ciPuService } from "../data/CiPuService"
import { Word, ciZuService } from "../data/CiZuService"

const ciPaiName = ref("")
onMounted(() => {
  ciPaiName.value = sessionStorage["ci-pai"] || ""
})
// 格律部分
const yunBook = ref(1)
const yunBookList = [{
  value: 1,
  label: "词林正韵"
}, {
  value: 0,
  label: "平水韵"
}, {
  value: 2,
  label: "中华新韵"
}, {
  value: 3,
  label: "中华通韵"
}]
const strictMode = ref(false)
// 组词部分
const wordListStatus = ref(true)
// 词谱数据
const ciPuMap = reactive(new Map<number, CiPu>())
const ciPuIdList = reactive(new Array<number>())
onMounted(() => {
  ciPuService.get(parseInt(sessionStorage["ci-pai-id"])).forEach((v) => {
    ciPuMap.set(v.id, v)
    ciPuIdList.push(v.id)
  })
})
// 标签页
const ciPuTab = ref(0)
onMounted(() => {
  ciPuTab.value = ciPuIdList[0]
})
const updateTab = (newTab: number) => {
  ciPuTab.value = newTab
}
// 所填内容
const contentMap = reactive(new Map<number, string>())
onMounted(() => {
  ciPuIdList.forEach((v) => {
    if (sessionStorage.getItem("ciPu" + v) != null) {
      contentMap.set(v, sessionStorage.getItem("ciPu" + v))
    } else {
      contentMap.set(v, "")
    }
  })
})
//
const updateHandle = (content: string) => {
  contentMap.set(ciPuTab.value, content)
  sessionStorage.setItem("ciPu" + ciPuTab.value, content)
}
// 候选词列表
const wordList = reactive(new Array<Word>())
const nextZiList = reactive(new Array<Word>())
const updateWordList = (searchChar: string, searchPu: string) => {
  wordList.length = 0
  if (searchChar.length > 0) {
    ciZuService.getWordList(searchChar, searchPu, yunBook.value).forEach((w) => wordList.push(w))
  }
}
// 顶部按钮
const message = useMessage()
onMounted(() => {
  message.info("离开页面前务必复制到本地保存", { duration: 3000 })
})
const handleCopy = (e: ClipboardEvent) => {
  e.clipboardData && e.clipboardData.setData('text/plain', contentMap.get(ciPuTab.value));
  e.preventDefault();
  document.removeEventListener('copy', handleCopy);
}
const copyContent = () => {
  document.addEventListener('copy', handleCopy);
  if (document.execCommand('copy')) {
    message.success("复制成功", { duration: 3000 })
  } else {
    message.error("复制失败", { duration: 3000 })
  }
}
const clearContent = () => {
  sessionStorage.removeItem("ciPu" + ciPuTab.value)
  contentMap.set(ciPuTab.value, "")
  wordList.length = 0
}
const showModal = ref(false)
const returnBack = () => {
  window.location.href = import.meta.env.BASE_URL
}
</script>

<style scoped>

</style>