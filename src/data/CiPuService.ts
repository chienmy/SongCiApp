import ciPuJSON from "./ciPu.json"

export interface CiPu {
  id: number
  ci_pai_id: number
  author: string
  size: number
  content: string
  example: string
  description: string
  introduction: string
  main_flag: number
  dual_part: string
  overlap_part: string
  mark_part: string
}

class CiPuService {

  private _ciPuMap = new Map<number, CiPu[]>()

  constructor() {
    ciPuJSON.forEach((c) => {
      if (! this._ciPuMap.has(c.ci_pai_id)) {
        this._ciPuMap.set(c.ci_pai_id, [])
      }
      this._ciPuMap.get(c.ci_pai_id).push(c)
    })
    // 对词谱排序，把标为主要的排在第一个
    this._ciPuMap.forEach((v, k) => {
      this._ciPuMap.set(k, v.sort((a, b) => (a.main_flag === 1 ? -1 : 1)))
    })
  }

  get(ciPaiId: number) {
    return this._ciPuMap.get(ciPaiId)
  }

}

export const ciPuService = new CiPuService()
