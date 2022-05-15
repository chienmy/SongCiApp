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
  needCheck: boolean
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
        needCheck: false,
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
    wordList = wordList.filter((w) => {
      let truth = yunService.getPingZe(w.word[1], book)
      if (! (pu == "2" || pu == "3")) {
        let target = (pu == "0" || /[a-z]/.test(pu)) ? 0 : 1
        if (! (truth == 2 || target == truth)) {
          return false
        }
      }
      return true
    })
    if (wordList.length > 20) wordList.length = 20
    return wordList
  }
}

export const ciZuService = new CiZuService()
