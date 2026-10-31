import { Inject, Injectable } from "@nestjs/common"
import * as fs from "fs"
import { POSTMAN_OPTIONS } from "./constants"
import { PostmanOptions } from "./interfaces"
import { joinUrl } from "./utils"

@Injectable()
export class PostmanService {
  private data!: Record<string, any>
  private baseUrl!: string

  constructor(@Inject(POSTMAN_OPTIONS) private options: PostmanOptions) {
    this.init()
  }

  init() {
    this.data = {
      info: {
        name: this.options.collectionName,
        version: "v2.0.0",
        description: this.options.description,
        schema: "https://schema.getpostman.com/json/collection/v2.0.0/",
      },
      item: [],
    }
    this.baseUrl = joinUrl(this.options.url, this.options.prefix)
  }

  /** Add a folder. `itemGroup.item` holds its requests. */
  addItemGroup = (itemGroup: Record<string, any>) => {
    if (!Array.isArray(itemGroup.item)) itemGroup.item = []
    this.data.item.push(itemGroup)
  }

  /**
   * Add a request to the folder with the given id (or name). `request.request.url` is the
   * route path; it is prefixed with `url`, `prefix` and the folder's `prefix`.
   * Without a matching folder the request is added at the top level.
   */
  addItemGroupItem = (request: Record<string, any>, itemGroup: string) => {
    const groups: Record<string, any>[] = this.data.item.filter(
      (obj: Record<string, any>) => Array.isArray(obj.item)
    )
    const group =
      groups.find((obj) => obj.id === itemGroup) ||
      groups.find((obj) => obj.name === itemGroup)
    request.request.url = joinUrl(this.baseUrl, group?.prefix, request.request.url)
    if (group) group.item.push(request)
    else this.data.item.push(request)
  }

  printCollection = () => {
    const collectionPath = this.options.filePath
      ? this.options.filePath + "collection.json"
      : "collection.json"
    fs.writeFileSync(collectionPath, JSON.stringify(this.data), {
      flag: "w+",
    })
  }
}
