import { Inject, Injectable, Logger } from "@nestjs/common"
import * as fs from "fs"
import * as path from "path"
import { POSTMAN_OPTIONS, POSTMAN_SCHEMA } from "./constants"
import { PostmanOptions } from "./interfaces"
import { joinUrl } from "./utils"

@Injectable()
export class PostmanService {
  private readonly logger = new Logger("PostmanModule")
  private data!: Record<string, any>
  private baseUrl!: string

  constructor(@Inject(POSTMAN_OPTIONS) private options: PostmanOptions) {
    this.init()
  }

  init() {
    this.data = {
      info: {
        name: this.options.collectionName,
        description: this.options.description,
        schema: POSTMAN_SCHEMA,
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

  /** Write the collection to `<filePath>/collection.json`. */
  printCollection = () => {
    const dir = this.options.filePath || ""
    const file = path.join(dir, "collection.json")
    try {
      if (dir) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, JSON.stringify(this.data, null, 2))
    } catch (e) {
      // a dev tool must not stop the app from starting (e.g. on a read-only file system)
      this.logger.warn(
        `Could not write the Postman collection to ${file}: ${(e as Error).message}`
      )
    }
  }
}
