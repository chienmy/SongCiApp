<script lang="ts">
import {defineComponent, unref, Ref} from 'vue'
import { NButton, NCard, NDivider, NInput, NGrid, NGridItem, NList, NListItem, NTabs, NTabPane, NTag, NSpace, NRadioGroup, NRadio } from 'naive-ui'
import { InputInst } from 'naive-ui'
import HttpClient from "../components/client";
import { CiPu, Word } from "../components/model"

export default defineComponent({
  components: {
    NButton, NCard, NDivider, NInput, NGrid, NGridItem, NList, NListItem, NTabs, NTag, NTabPane, NSpace, NRadioGroup, NRadio
  },
  computed: {
  },
  data: () => ({
    client: new HttpClient(),
    ciPaiName: String(),
    // 词谱数据
    ciPuMap: new Map<number, CiPu>(),
    // 词谱列表，map中按序排列
    ciPuTabList: new Array<number>(),
    // 当前词谱ID
    ciPuTab: 0,
    // 所有内容
    contentList: new Array<Array<string>>(),
    // 输入框控制
    inputList: new Array<Array<Ref<InputInst>>>(),
    inputStatusList: new Array<number>(),
    // 各标签页词谱，分行列表格式
    ciPuList: new Array<Array<string>>(),
    // 光标当前位置在词谱中的索引
    currentIndex: 0,
    //
    yunBook: "psy",
    // 候选词列表
    wordList: new Array<Word>(),
    cellHeight: 30,
    cellWidth: 30,
    cellMargin: 3,
    yunBookList: [{
      value: "psy",
      label: "平水韵"
    }, {
      value: "clzy",
      label: "词林正韵"
    }, {
      value: "zhxy",
      label: "中华新韵"
    }, {
      value: "zhty",
      label: "中华通韵"
    }]
  }),
  methods: {
    getHeight(tabIndex: number) {
      return {
        height: (2 * this.ciPuList[tabIndex].length * this.cellHeight) + 'pt'
      }
    },
    getYun(c: string) {
      if (c == "0") {
        return "◯"
      } else if (c == "1") {
        return "●"
      } else if (c == "2") {
        return "◎"
      } else if (c == "3") {
        return "◉"
      } else {
        let pingYun = "①②③④⑤⑥⑦⑧⑨⑩"
        let zeYun = "❶❷❸❹❺❻❼❽❾❿"
        let index = c.charCodeAt(0) - "a".charCodeAt(0)
        if ((index >= 0) && (index < 26)) {
          return pingYun.charAt(index)
        }
        index = c.charCodeAt(0) - "A".charCodeAt(0)
        if ((index >= 0) && (index < 26)) {
          return zeYun.charAt(index)
        }
      }
      return c
    },
    getYunStyle(tabIndex: number, row: number, column: number) {
      // 设置颜色
      let code = this.inputStatusList[this.getIndex(tabIndex, row, column)]
      let colorArray = ["black", "#c21f30", "#1a3b32", "#d9a40e"]
      return {
        position: 'absolute',
        left: (column * this.cellWidth) + 'pt',
        top: (2 * row * this.cellHeight) + 'pt',
        width: this.cellWidth + 'pt',
        textAlign: 'center',
        fontFamily: "CiPuSymbol",
        fontSize: '18pt',
        color: colorArray[code + 1]
      }
    },
    getInputStyle(row: number, column: number) {
      return {
        position: 'absolute',
        left: (column * this.cellWidth) + 'pt',
        top: ((2 * row + 1) * this.cellHeight) + 'pt',
        width: (this.cellWidth - this.cellMargin * 2) + 'pt',
        margin: '0 ' + this.cellMargin + 'pt',
        textAlign: 'center',
      }
    },
    // 获取行列单元格在词谱中的位置索引
    getIndex(tabIndex: number, row: number, column: number) {
      if (tabIndex >= this.ciPuTabList.length) {
        console.log("error")
        return 0
      }
      let index = 0
      for (let i = 0; i < row; i++) {
        index += this.ciPuList[tabIndex][i].length
      }
      return index + column
    },
    // 输入文本时操作
    inputText(text: string, tabIndex: number, row: number, column: number) {
      if (text.length > 0) {
        // 只取首字
        text = text[0]
        if (this.currentIndex < this.contentList[tabIndex].length - 1) {
          if ((this.contentList[tabIndex][this.getIndex(tabIndex, row, column) + 1].length == 0) ||
              ("，。、".indexOf(this.contentList[tabIndex][this.getIndex(tabIndex, row, column) + 1]) == -1)) {
            // 更新候选词列表
            this.updateWordList(text, row, column)
            unref(this.inputList[tabIndex][this.currentIndex + 1]).focus()
          } else {
            unref(this.inputList[tabIndex][this.currentIndex + 2]).focus()
          }
        }
      } else {
        // 非首字则回到前一个输入处
        if (this.getIndex(tabIndex, row, column) > 0) {
          this.updateWordList(this.contentList[tabIndex][this.getIndex(tabIndex, row, column) - 1], row, column)
        }
      }
      this.updateStatus()
    },
    addInput (el: Ref, tabIndex: number, index: number) {
      this.inputList[tabIndex][index] = el
    },
    deleteInput(tabIndex: number, row: number, column: number) {
      let index = this.getIndex(tabIndex, row, column)
      if (index > 0 && this.contentList[tabIndex][index].length == 0) {
        let preText = this.contentList[tabIndex][index - 1]
        if (preText.length != 0) {
          // 前一个不是标点
          if ("，。、".indexOf(preText) == -1) {
            unref(this.inputList[tabIndex][index - 1]).focus()
          } else {
            unref(this.inputList[tabIndex][index - 2]).focus()
          }
        } else {
          unref(this.inputList[tabIndex][index - 1]).focus()
        }
      }
      this.updateStatus()
    },
    updateIndex(tabIndex: number, row: number, column: number) {
      this.currentIndex = this.getIndex(tabIndex, row, column)
      if (this.currentIndex > 0) {
        this.updateWordList(this.contentList[tabIndex][this.currentIndex - 1], row, column)
      }
    },
    // 切换标签页时更新词谱
    updatePu(ciPuId: number) {
      this.ciPuTab = ciPuId
      this.wordList = new Array<Word>()
      this.updateStatus()
    },
    // 更新候选词列表
    updateWordList(text: string, row: number, column: number) {
      if (text.length == 0 || "，。、".indexOf(text) != -1) {
        this.wordList = new Array<Word>()
        return
      }
      if (column < this.ciPuList[this.ciPuTab][row].length - 1) {
        this.client.getWordList(text, this.yunBook, this.ciPuList[this.ciPuTab][row][column + 1])
            .then((data) => {
              this.wordList = data.data.sort((a, b) => (a.count > b.count ? -1 : 1))
              this.wordList = this.wordList.filter((v) => v.count >= 3).slice(0, 20)
            })
      }
    },
    // 更新检查状态
    updateStatus() {
      let pu = this.ciPuList[this.ciPuTab].join("")
      let content = this.contentList[this.ciPuTab].map((s) => s.length == 0 ? " " : s).join("")
      this.client.checkYun(pu, content, this.yunBook)
          .then((data) => {
            this.inputStatusList = new Array<number>()
            for (let code of data.data) {
              this.inputStatusList.push(code)
            }
          })
    }
  },
  mounted() {
    this.ciPaiName = sessionStorage["ci-pai"]
    this.client.getCiPuList(parseInt(sessionStorage["ci-pai-id"]))
        .then((data) => {
          data.data.forEach((item) => this.ciPuMap.set(item.id, item))
          // 对词谱排序，把标为主要的排在第一个
          this.ciPuTabList = Array.from(this.ciPuMap.keys())
          this.ciPuTabList = this.ciPuTabList.sort((a, b) => (this.ciPuMap.get(a)?.main_flag === 1 ? -1 : 1))
          this.ciPuTabList.forEach((id) => {
            // 构造每个页面的词谱文本
            let currentPu = new Array<string>()
            let currentLength = 0;
            for (let s of (this.ciPuMap.get(id)?.content || "").split("|")) {
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
                currentPu.push(s.substring(0, index + 1))
                currentPu.push(s.substring(index + 1))
              } else {
                currentPu.push(s)
              }
            }
            this.ciPuList.push(currentPu)
            // 构造词谱下的输入框内容
            let currentContent = new Array<string>(currentLength)
            // 填充标点
            let index = 0
            for (let i = 0; i < currentPu.length; i++) {
              for (let j = 0; j < currentPu[i].length; j++) {
                if ("，。、".indexOf(currentPu[i][j]) != -1) {
                  currentContent[index] = currentPu[i][j]
                } else {
                  currentContent[index] = ""
                }
                index ++
              }
            }
            this.contentList.push(currentContent)
            // 构造词谱下的输入框引用
            this.inputList.push(new Array<Ref<InputInst>>(currentLength))
            this.currentIndex = 0
          })
        })
  }
})
</script>

<template>
  <n-grid cols="12" item-responsive>
    <n-grid-item span="0 1200:1 1500:2"></n-grid-item>
    <n-grid-item span="12 1200:10 1500:8">
      <n-card>
        <n-grid :cols="3" :x-gap="10">
          <n-grid-item :span="1">
            <h1>作词 - {{ ciPaiName }}</h1>
          </n-grid-item>
          <n-grid-item :span="2" style="display: flex; justify-content: flex-end; align-items: center">
            <n-radio-group v-model:value="yunBook" name="radiogroup">
              <n-space>
                <n-radio v-for="item in yunBookList" :key="item.value" :value="item.value">
                  {{ item.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </n-grid-item>
        </n-grid>
        <n-grid :cols="4" :x-gap="20">
          <n-grid-item :span="3">
            <n-tabs v-model:value="ciPuTab" type="line" @update:value="(v) => updatePu(v)" animated>
              <n-tab-pane v-for="(ciPuId, tabIndex) in ciPuTabList"
                          :name="tabIndex"
                          :tab="ciPuMap.get(ciPuId).author"
                          display-directive="show">
                <p>{{ ciPuMap.get(ciPuId).description }}</p>
                <div v-for="(s, i) in ciPuList[tabIndex]" :key="i" style="position: fixed">
                  <span v-for="(c, j) in s" :style="getYunStyle(tabIndex, i, j)">{{ getYun(c) }} </span>
                </div>
                <div v-for="(s, i) in ciPuList[tabIndex]" :key="i" style="position: fixed">
                  <div v-for="(c, j) in s" :key="j" :style="getInputStyle(i, j)" class="content-input">
                    <n-input v-model:value="contentList[tabIndex][getIndex(tabIndex, i, j)]"
                             :ref="(el) => addInput(el, tabIndex, getIndex(tabIndex, i, j))"
                             :autofocus="i + j === 0"
                             :disabled="'，。、'.indexOf(c) !== -1"
                             @input="(v) => inputText(v, tabIndex, i, j)"
                             @focus="updateIndex(tabIndex, i, j)"
                             @keydown.delete="deleteInput(tabIndex, i, j)"
                             maxlength="1" type="text" placeholder=""/>
                  </div>
                </div>
                <div :style="getHeight(tabIndex)"></div>
              </n-tab-pane>
            </n-tabs>
          </n-grid-item>
          <n-grid-item :span="1">
            <n-tabs value="only" type="line">
              <n-tab-pane name="only" tab="候选词列表" style="text-align: center">
                <n-list v-if="wordList.length > 0" bordered>
                  <n-list-item v-for="item in wordList" style="padding: 6px 10px">
                    <span>{{ item.word[0] }}</span>
                    <span :style="'color: ' + (item.needCheck ? 'darkorange' : 'green')">{{ item.word[1] }}</span>
                    <n-tag size="small" round>{{ item.count }}</n-tag>
                  </n-list-item>
                </n-list>
                <span v-if="wordList.length === 0">暂无</span>
              </n-tab-pane>
            </n-tabs>
          </n-grid-item>
        </n-grid>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<style>
@font-face {
  font-family: "CiPuSymbol";
  src: url("../assets/CiPuSymbol.ttf");
}

.content-input .n-input-wrapper {
  padding-left: 0;
  padding-right: 0;
}
</style>
