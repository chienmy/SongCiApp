import pinyin from "pinyin"
import ciPaiJSON from "./ciPai.json"

interface CiPai {
  id: number
  name: string
  description: string
}

class CiPaiService {

  private _ciPaiMap = new Map<string, CiPai>()
  private readonly _ciPaiList = ["虞美人", "苏幕遮", "醉花阴", "南乡子", "念奴娇", "天仙子", "钗头凤", "浪淘沙", "渔家傲", "踏莎行", "临江仙", "阮郎归", "菩萨蛮", "浣溪沙", "清平乐", "蝶恋花", "采桑子", "青玉案", "鹧鸪天", "江城子", "卜算子", "点绛唇", "鹊桥仙", "满庭芳", "如梦令", "生查子", "破阵子", "沁园春", "长相思", "忆江南", "玉楼春", "诉衷情", "少年游", "雨霖铃", "洞仙歌", "谒金门", "乌夜啼", "西江月", "渔歌子", "望海潮", "小重山", "画堂春", "定风波", "水龙吟", "永遇乐", "满江红", "南歌子", "声声慢", "贺新郎", "一剪梅", "忆秦娥", "扬州慢", "风入松", "十六字令", "水调歌头", "八声甘州"]

  constructor() {
    ciPaiJSON.forEach((d: CiPai) => {
      this._ciPaiMap.set(d.name, d)
    })
    this._ciPaiList = this._ciPaiList.sort((a, b) => pinyin.compare(a, b))
  }

  get mostUseCiPai() {
    return this._ciPaiList
  }

  // 搜索包含字符串的词牌
  search(text: string) {
    return Array.from<string>(this._ciPaiMap.keys()).filter((s) => (s.indexOf(text) != -1))
  }

  // 是否包含此词牌
  has(name: string) {
    return this._ciPaiMap.has(name)
  }

  // 返回词牌的ID
  get(name: string) {
    return this._ciPaiMap.get(name)
  }

  // 词牌名按拼音首字母分组
  groupByPinYin() {
    let result = new Map<string, string[]>()
    this._ciPaiMap.forEach((ciPai) => {
      let pinyinName = pinyin(ciPai.name, {
        heteronym: true,
        style: pinyin.STYLE_NORMAL
      })
      let firstChar = pinyinName[0][0][0]
      if (! result.has(firstChar)) {
        result.set(firstChar, [])
      }
      result.get(firstChar)?.push(ciPai.name)
    })
    for (let [key, list] of result) {
      result.set(key, list.sort((a, b) => pinyin.compare(a, b)))
    }
    return result
  }

}

export const ciPaiService = new CiPaiService()
