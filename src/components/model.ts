export interface CiPai {
  id: number
  name: string
  description: string
}

export interface CiPu {
  id: number
  ciPaiId: number
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

export interface Word {
  id: number,
  word: string,
  count: number,
  needCheck: boolean
}