import axios, { AxiosInstance } from "axios"
import { CiPai, CiPu, Word } from "./model";

export default class HttpClient {
  protected readonly instance: AxiosInstance

  public constructor() {
    this.instance = axios.create({
      baseURL: "http://127.0.0.1:8080/",
      timeout: 5000
    })
  }

  public getCiPaiList() {
    return this.instance.get<CiPai[]>("/cipai")
  }

  public getCiPuList(ciPaiId: number) {
    return this.instance.get<CiPu[]>("/cipu", {
      params: {
        cipai: ciPaiId
      }
    })
  }

  public getWordList(zi: string, book: string, yun: string) {
    return this.instance.get<Word[]>("/word", {
      params: {
        zi: zi,
        book: book,
        yun: yun
      }
    })
  }

  public checkYun(pu: string, content: string, book:string, strictMode: boolean) {
    return this.instance.post<number[]>("/pz/check", {
      pu: pu,
      content: content,
      book: book,
      strictMode: strictMode
    })
  }

  public checkYunZi(yun: string[], yunGroup: string[][], book:string) {
    return this.instance.post<number[][]>("/yun/check", {
      yun: yun,
      yunGroup: yunGroup,
      book: book
    })
  }
}