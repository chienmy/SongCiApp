<template>
  <n-grid :cols="12" item-responsive>
    <n-grid-item span="12 1200:10 1500:8" offset="0 1200:1 1500:2">
      <n-card>
        <h1>选词</h1>
        <n-grid :cols="8" :x-gap="10" item-responsive>
          <n-grid-item span="4 800:6">
            <n-input v-model:value="searchText" type="text" size="large" placeholder="君欲寻何？"/>
          </n-grid-item>
          <n-grid-item span="2 800:1">
            <n-button size="large" block @click="search">寻之</n-button>
          </n-grid-item>
          <n-grid-item span="2 800:1">
            <n-button size="large" block :disabled="!allowNext" @click="nextStep">以此作词</n-button>
          </n-grid-item>
        </n-grid>
        <n-grid :cols="2" :x-gap="10" style="margin-top: 10px" :collapsed-rows="2" item-responsive>
          <n-grid-item span="2 800:1">
            <n-tabs v-model:value="tabValue" type="line" @update:value="updateTab" animated>
              <n-tab-pane name="usual" tab="常用">
                <n-space>
                  <CiPaiTag v-for="item in mostUseCiPaiList" :tag-name="item" @click="clickTag"/>
                </n-space>
              </n-tab-pane>
              <n-tab-pane name="all" tab="全部">
                <n-grid v-if="searchResult.length === 0" :cols="9" :x-gap="0">
                  <n-grid-item :span="1">
                    <n-anchor ignore-gap>
                      <div v-for="i in 26" :key="i">
                        <n-anchor-link v-if="allTagGroup.has(String.fromCharCode((97 + i)))"
                                       :title="String.fromCharCode((65 + i))"
                                       href="#" @click="updateTag(String.fromCharCode((97 + i)))"/>
                      </div>
                    </n-anchor>
                  </n-grid-item>
                  <n-grid-item :span="8">
                    <n-space>
                      <CiPaiTag v-for="item in allTagGroup.get(currentTag)" :tag-name="item" @click="clickTag"/>
                    </n-space>
                  </n-grid-item>
                </n-grid>
                <n-space v-if="searchResult.length !== 0">
                  <CiPaiTag v-for="item in searchResult" :tag-name="item" @click="clickTag"/>
                </n-space>
              </n-tab-pane>
            </n-tabs>
          </n-grid-item>
          <n-grid-item span="2 800:1">
            <n-tabs value="only" type="line" justify-content="center">
              <n-tab-pane name="only" :tab="cardTitle">
                {{ cardContent }}
              </n-tab-pane>
            </n-tabs>
          </n-grid-item>
        </n-grid>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import {
  NAnchor,
  NAnchorLink,
  NButton,
  NCard,
  NInput,
  NGrid,
  NGridItem,
  NTabs,
  NTabPane,
  NSpace
} from "naive-ui"
import {ref, reactive, computed} from "vue"
import CiPaiTag from "../components/CiPaiTag.vue"
import {ciPaiService} from "../data/CiPaiService"

// 常用词牌列表
const mostUseCiPaiList = ciPaiService.mostUseCiPai
// 全词牌首字母分类展示
const allTagGroup = ciPaiService.groupByPinYin()
// 标签页与标签页切换
const tabValue = ref("usual")
const updateTab = (v: string) => {
  tabValue.value = v
}
// 文本输入框的值
const searchText = ref("")
// 搜索结果与搜索函数
const searchResult = reactive(new Array<string>())
const search = () => {
  if (searchText.value.length > 0) {
    searchResult.length = 0
    searchResult.push(...ciPaiService.search(searchText.value))
    tabValue.value = "all"
  }
}
// 是否允许跳转到填词页面
const allowNext = computed(() => ciPaiService.has(searchText.value))
// 跳转
const nextStep = () => {
  sessionStorage.setItem("ci-pai", searchText.value)
  sessionStorage.setItem("ci-pai-id", String(ciPaiService.get(searchText.value).id))
  searchText.value = ""
  window.location.href = import.meta.env.BASE_URL + "main"
}
// 当前首字母与切换
const currentTag = ref("a")
const updateTag = (tag: string) => {
  currentTag.value = tag
}
// 右侧卡片内容与更新
const cardTitle = ref("择一词牌")
const cardContent = ref("暂略")
const clickTag = (tagName: string) => {
  searchText.value = tagName
  cardTitle.value = tagName
  cardContent.value = ciPaiService.get(tagName)?.description || "暂略"
}
</script>

<style scoped>

</style>