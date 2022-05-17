import ciZuJSON from "./ciZu.json"
import { yunService } from "./YunService"

interface CiZu {
  id: number
  word: string
  count: number
  next_zi: string
}

interface NextCiZu {
  word: string
  count: number
}

export interface Word {
  id: number
  word: string
  count: number
  needCheck: boolean[]
}

class CiZuService {

  private _ciZuMap = new Map<string, Word[]>()
  private _nextCiZuMap = new Map<string, NextCiZu[]>()

  constructor() {
    ciZuJSON.forEach((c: CiZu) => {
      let key = c.word[0]
      if (! this._ciZuMap.has(key)) {
        this._ciZuMap.set(key, [])
      }
      this._ciZuMap.get(key).push({
        id: c.id,
        word: c.word,
        count: c.count,
        needCheck: [],
      })
      //
      let nextCiZuList = []
      let arr = c.next_zi.split("|")
      for (let i = 0; i < arr.length; i += 2) {
        nextCiZuList.push({
          word: arr[i],
          count: parseInt(arr[i + 1])
        })
      }
      this._nextCiZuMap.set(c.word, nextCiZuList)
    })
    for (let k of this._ciZuMap.keys()) {
      this._ciZuMap.set(k, this._ciZuMap.get(k).sort((a, b) => (a.count > b.count ? -1 : 1)))
    }
  }

  // 获得候选词组列表
  getWordList(char: string, pu: string, book: number) {
    let wordList = this._ciZuMap.get(char.charAt(0)) || []
    let result = []
    for (let w of wordList) {
      let truth = yunService.checkPu(w.word[1], book, pu, false)
      if (truth <= 0) {
        continue
      }
      w.needCheck = [false, truth == 2]
      result.push(w)
    }
    if (result.length > 20) result.length = 20
    return result
  }

  getNextWordList(text: string, pu: string, book: number): Word[] {
    let result = []
    if (this._nextCiZuMap.has(text)) {
      for (let w of this._nextCiZuMap.get(text)) {
        if (w.word.length > pu.length) {
          continue
        }
        let checkFlag = new Array<boolean>()
        for (let i = 0; i < pu.length; i++) {
          let flag = yunService.checkPu(w.word[i], book, pu[i], false)
          if (flag <= 0) {
            break
          } else {
            checkFlag.push(flag == 2)
          }
        }
        if (checkFlag.length == pu.length) {
          result.push({
            id: result.length,
            word: w.word,
            count: w.count,
            needCheck: checkFlag
          })
        }
      }
    }
    return result
  }
}

export const ciZuService = new CiZuService()
