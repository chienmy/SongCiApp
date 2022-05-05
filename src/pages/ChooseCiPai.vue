<script lang="ts">
import {defineComponent} from 'vue'
import {
  NAnchor,
  NAnchorLink,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDivider,
  NInput,
  NGrid,
  NGridItem,
  NTabs,
  NTabPane,
  NSpace
} from 'naive-ui'
import pinyin from 'pinyin'
import HttpClient from '../components/client'
import {CiPai} from "../components/model"

export default defineComponent({
  components: {
    NAnchor,
    NAnchorLink,
    NButton,
    NCard,
    NCollapse,
    NCollapseItem,
    NDivider,
    NInput,
    NGrid,
    NGridItem,
    NTabs,
    NTabPane,
    NSpace
  },
  computed: {
    allowNext() {
      return this.ciPaiMap.has(this.searchText)
    }
  },
  data: () => ({
    client: new HttpClient(),
    searchText: String(),
    tabPage: "usual",
    usualItems: ['虞美人', '苏幕遮', '醉花阴', '南乡子', '念奴娇', '天仙子', '钗头凤', '浪淘沙', '渔家傲', '踏莎行', '临江仙', '阮郎归', '菩萨蛮', '浣溪沙', '清平乐', '蝶恋花', '采桑子', '青玉案', '鹧鸪天', '江城子', '卜算子', '点绛唇', '鹊桥仙', '满庭芳', '如梦令', '生查子', '破阵子', '沁园春', '长相思', '忆江南', '玉楼春', '诉衷情', '少年游', '雨霖铃', '洞仙歌', '谒金门', '乌夜啼', '西江月', '渔歌子', '望海潮', '小重山', '画堂春', '定风波', '水龙吟', '永遇乐', '满江红', '南歌子', '声声慢', '贺新郎', '一剪梅', '忆秦娥', '扬州慢', '风入松', '十六字令', '水调歌头', '八声甘州'],
    ciPaiMap: new Map<string, CiPai>(),
    allItems: new Array<[string, string[]]>(),
    currentGroup: new Array<string>(),
    searchResult: new Array<string>(),
    cardTitle: "择一词牌，示以详情",
    cardContent: "暂略"
  }),
  methods: {
    clickTag(item: string) {
      this.searchText = item
      this.cardTitle = item
      this.cardContent = this.ciPaiMap.get(item)?.description || ""
    },
    nextStep() {
      sessionStorage.setItem("ci-pai", this.searchText)
      sessionStorage.setItem("ci-pai-id", String(this.ciPaiMap.get(this.searchText)?.id || -1))
      this.searchText = ""
      window.location.href = "/main"
    },
    search() {
      if (this.searchText.length > 0) {
        this.searchResult = Array.from(this.ciPaiMap.keys()).filter((s: string) => (s.indexOf(this.searchText) != -1))
        this.tabPage = "all"
      }
    },
    // 字符串按拼音首字母分类，按字母顺序排列
    groupByPinyin(items: Iterable<string>) {
      let pinyinMap = new Map()
      for (let item of items) {
        let pinyinName = pinyin(item, {
          heteronym: true,
          style: pinyin.STYLE_NORMAL
        })
        let firstChar = pinyinName[0][0][0]
        if (pinyinMap.has(firstChar)) {
          pinyinMap.get(firstChar).push(item)
        } else {
          pinyinMap.set(firstChar, [item])
        }
      }
      return Array.from(pinyinMap.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1))
    },
    // 更新当前字母应显示的词牌
    updateCurrentGroup(key: string) {
      for (let record of this.allItems) {
        if (record[0] == key) {
          this.currentGroup = record[1]
          return
        }
      }
      this.currentGroup = []
    }
  },
  mounted() {
    this.usualItems = this.usualItems.sort((a, b) => pinyin.compare(a, b))
    this.client.getCiPaiList()
        .then((data) => {
          for (let item of data.data) {
            this.ciPaiMap.set(item.name, item)
          }
          this.allItems = this.groupByPinyin(this.ciPaiMap.keys())
          this.updateCurrentGroup("a")
        })
  },
  watch: {
    searchText(newText, oldText) {
      console.log(newText, oldText)
      if (newText.length == 0 && oldText != 0) {
        this.tabPage = "usual"
        this.searchResult = new Array<string>()
      }
    }
  }
})
</script>

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
            <n-tabs :value="tabPage" type="line" @update:value="(v) => tabPage = v" animated>
              <n-tab-pane name="usual" tab="常用">
                <n-space>
                  <n-button strong secondary v-for="item in usualItems" @click="clickTag(item)">{{ item }}</n-button>
                </n-space>
              </n-tab-pane>
              <n-tab-pane name="all" tab="全部">
                <n-grid v-if="searchResult.length === 0" :cols="9" :x-gap="0">
                  <n-grid-item :span="1">
                    <n-anchor ignore-gap>
                      <n-anchor-link v-for="record in allItems" :key="record[0]" :title="record[0].toUpperCase()"
                                     href="#" @click="updateCurrentGroup(record[0])"/>
                    </n-anchor>
                  </n-grid-item>
                  <n-grid-item :span="8">
                    <n-space>
                      <n-button strong secondary v-for="item in currentGroup" @click="clickTag(item)">
                        {{ item }}
                      </n-button>
                    </n-space>
                  </n-grid-item>
                </n-grid>
                <n-space v-if="searchResult.length !== 0">
                  <n-button strong secondary v-for="item in searchResult" @click="clickTag(item)">
                    {{ item }}
                  </n-button>
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
      <div style="text-align: center; padding: 15px;">
        <span> 助吾填词 2022 · Made by <a href="https://github.com/chienmy/SongCiApp">Chienmy</a> </span>
      </div>
    </n-grid-item>
  </n-grid>
</template>

<style>
</style>
