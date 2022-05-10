<template>
  <n-grid :cols="12" item-responsive>
    <n-grid-item span="12 1200:10 1500:8" offset="0 1200:1 1500:2">
      <n-card>
        <n-grid cols="4" x-gap="10" :collapsed-rows="2" item-responsive>
          <n-grid-item span="4 900:1">
            <h1>作词 - {{ ciPaiName }}</h1>
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
import { NCard, NGrid, NGridItem, NList, NListItem, NTabs, NTabPane, NTag, NSpace, NRadioGroup, NRadio, NSwitch } from 'naive-ui'
import CiInput from '../components/CiInput.vue'
import { onMounted, ref, reactive } from "vue"
import { CiPu, CiZu, Word } from "../components/model"
import allCiPu from "../data/ciPu"
import allCiZu from "../data/ciZu"
import {getPingZe, unzipCiZu} from "../data/utils";

const ciPaiName = ref("")
onMounted(() => {
  ciPaiName.value = sessionStorage["ci-pai"] || ""
})
// 格律部分
const yunBook = ref("clzy")
const yunBookList = [{
  value: "clzy",
  label: "词林正韵"
}, {
  value: "psy",
  label: "平水韵"
}, {
  value: "zhxy",
  label: "中华新韵"
}, {
  value: "zhty",
  label: "中华通韵"
}]
const strictMode = ref(false)
// 组词部分
const wordListStatus = ref(true)
// 词谱数据
const ciPuMap = reactive(new Map<number, CiPu>())
const ciPuIdList = reactive(new Array<number>())
onMounted(() => {
  allCiPu.get(parseInt(sessionStorage["ci-pai-id"]))?.forEach((v) => {
    ciPuMap.set(v.id, v)
  })
  // 对词谱排序，把标为主要的排在第一个
  Array.from(ciPuMap.values()).sort((a, b) => (a.main_flag === 1 ? -1 : 1)).forEach((item) => {
    ciPuIdList.push(item.id)
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
    contentMap.set(v, "")
  })
})
//
const updateHandle = (content: string) => {
  // console.log(content)
}
// 候选词列表
const wordList = reactive(new Array<Word>())
const nextZiList = reactive(new Array<Word>())
const updateWordList = (searchChar: string, searchPu: string) => {
  wordList.length = 0
  let ciZuList = new Array<CiZu>()
  allCiZu.get(searchChar)?.forEach((s) => {
    ciZuList.push(unzipCiZu(s))
  })
  ciZuList = ciZuList.sort((a, b) => (a.count > b.count ? -1 : 1))
  for (let c of ciZuList) {
    let truth = getPingZe(c.word[1], yunBook.value)
    if (! (searchPu == "2" || searchPu == "3")) {
      let target = (searchPu == "0" || /[a-z]/.test(searchPu)) ? 0 : 1
      if (! (truth == 2 || target == truth)) {
        continue
      }
    }
    wordList.push({
      id: c.id,
      word: c.word,
      count: c.count,
      needCheck: (truth == -1 || truth == 2)
    })
  }
  // 长度裁剪
  if (wordList.length > 16) wordList.length = 16
}

</script>

<style scoped>

</style>