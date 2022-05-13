import yunJSON from "./yun.json"

export interface Yun {
  id: number
  book: number
  part: string
  ping_ze: number
  value: string
}

class YunService {

  private _yunMap = new Map<string, Yun[]>()

  constructor() {
    yunJSON.forEach((y) => {
      let key = y.book + y.value
      if (! this._yunMap.has(key)) {
        this._yunMap.set(key, [])
      }
      this._yunMap.get(key).push(y)
    })
  }

  getPingZe(c: string, book: number) {
    let result = -1
    for (let yun of this._yunMap.get(book + c) || []) {
      if (result == -1) {
        result = yun.ping_ze
      } else if (result != yun.ping_ze) {
        return 2
      }
    }
    return result
  }

  checkPu(c: string, book: number, pu: string, strictMode: boolean) {
    if (strictMode) {
      if (pu == "2") pu = "0"
      if (pu == "3") pu = "1"
    }
    if (c == "") {
      return -1
    } else if (pu == "2" || pu == "3") {
      return 1
    } else {
      let truth = this.getPingZe(c, book)
      if (truth == -1 || truth == 2) {
        return truth
      } else if (pu == "0" || /[a-z]/.test(pu)) {
        return truth == 0 ? 1 : 0
      } else if (pu == "1" || /[A-Z]/.test(pu)) {
        return truth == 1 ? 1 : 0
      }
    }
  }

  checkYun(book: number, yun: string, charList: string[]) {
    let result = new Array<number>(charList.length)
    let possibleYun = new Array<Set<string>>()
    charList.forEach((c) => {
      let innerSet = new Set<string>()
      if (c.length != 0) {
        this._yunMap.get(book + c).forEach((yun) => {
          innerSet.add(yun.part)
        })
        possibleYun.push(innerSet)
      }
    })
    if (possibleYun.length == 1) {
      charList.forEach((c, i) => {
        result[i] = (c.length != 0 ? 1 : -1)
      })
    } else if (possibleYun.length > 1) {
      let joinSet = new Set<string>([...possibleYun[0]])
      for (let i = 1; i < possibleYun.length; i++) {
        joinSet = new Set<string>([...joinSet].filter((item) => possibleYun[i].has(item)))
      }
      if (joinSet.size == 0) {
        charList.forEach((c, i) => {
          result[i] = (c.length != 0 ? 0 : -1)
        })
      } else {
        charList.forEach((c, i) => {
          result[i] = (c.length != 0 ? (this._yunMap.get(book + c).length == 1 ? 1 : 2) : -1)
        })
      }
    }
    return result
  }

}

export const yunService = new YunService()
