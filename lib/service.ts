import { Inject, Injectable } from "@nestjs/common"
import * as fs from "fs"
import { POSTMAN_OPTIONS } from "./constants"
import { PostmanOptions } from "./interfaces"

@Injectable()
export class PostmanService {
  private static data: Record<string, any>
  private static baseUrl: string
  constructor(@Inject(POSTMAN_OPTIONS) private options: PostmanOptions) {
    this.init()
  }

  async init() {
    PostmanService.data = {
      info: {
        name: this.options.collectionName,
        version: "v2.0.0",
        description: this.options.description,
        schema: "https://schema.getpostman.com/json/collection/v2.0.0/",
      },
      item: [],
    }
    PostmanService.baseUrl = this.options.url + this.options.prefix
  }

  addItemGroup = (itemGroup: Record<string, any>) => {
    if (!PostmanService.data.item) {
      PostmanService.data.item = [itemGroup]
    } else {
      PostmanService.data["item"].push(itemGroup)
    }
  }

  addItemGroupItem = (request: Record<string, any>, itemName: string) => {
    if (!PostmanService.data.item) {
      request.request.url = PostmanService.baseUrl + "/" + request.request.url
      PostmanService.data.item = [request]
    } else {
      const itemGroups = PostmanService.data.item.filter(
        (obj: { name: string }) => obj.name === itemName
      )
      if (!itemGroups.length) {
        request.request.url = PostmanService.baseUrl + "/" + request.request.url
        PostmanService.data.item.push(request)
      } else {
        const itemGroup = itemGroups[0]
        const items = itemGroup.item
        items.push(request)
        request.request.url =
          PostmanService.baseUrl +
          "/" +
          itemGroup.prefix +
          "/" +
          request.request.url
        PostmanService.data.item = PostmanService.data.item.map(
          (obj: { name: string }) => {
            if (obj.name === itemGroup.name) {
              return {
                ...obj,
                item: items,
              }
            }
            return obj
          }
        )
      }
    }
  }

  printCollection = () => {
    const collectionPath = this.options.filePath
      ? this.options.filePath + "collection.json"
      : "collection.json"
    fs.writeFileSync(collectionPath, JSON.stringify(PostmanService.data), {
      flag: "w+",
    })
  }
}
