import { Yun, CiZu } from "../components/model";
import allZiYun from "./ziYun";

const bookList = ["psy", "clzy", "zhxy", "zhty"]
const unzipZiYun = (s: string): Yun => {
  let arr = s.split("|")
  return {
    id: parseInt(arr[0]),
    value: arr[1],
    book: bookList[parseInt(arr[2])],
    part: arr[3],
    ping_ze: parseInt(arr[4])
  }
}

const unzipCiZu = (s: string): CiZu => {
  let arr = s.split("|")
  let nextZiMap = new Map<string, number>()
  for (let i = 3; i < arr.length; i+=2) {
    nextZiMap.set(arr[i], parseInt(arr[i + 1]))
  }
  return {
    id: parseInt(arr[0]),
    word: arr[1],
    count: parseInt(arr[2]),
    nextZi: nextZiMap
  }
}

const getPingZe = (c: string, book: string): number => {
  let result = -1
  for (let yun of allZiYun.get(book + c) || []) {
    if (result == -1) {
      result = unzipZiYun(yun).ping_ze
    } else if (result != unzipZiYun(yun).ping_ze) {
      return 2
    }
  }
  return result
}

export { unzipCiZu, unzipZiYun, getPingZe }