import { Inject, Injectable, Logger } from "@nestjs/common"
import * as fs from "fs"
import * as path from "path"
import { ID_NAMESPACE, POSTMAN_OPTIONS, POSTMAN_SCHEMA } from "./constants"
import { PostmanOptions } from "./interfaces"
import { joinUrl, uuidV5 } from "./utils"

@Injectable()
export class PostmanService {
  private readonly logger = new Logger("PostmanModule")
  private data!: Record<string, any>
  private baseUrl!: string
  private ids!: Set<string>

  constructor(@Inject(POSTMAN_OPTIONS) private options: PostmanOptions) {
    this.init()
  }

  init() {
    this.ids = new Set()
    this.data = {
      info: {
        // the same name gives the same id, so Postman replaces the collection on re-import
        _postman_id: uuidV5(this.options.collectionName || "", ID_NAMESPACE),
        name: this.options.collectionName,
        description: this.options.description,
        schema: POSTMAN_SCHEMA,
      },
      item: [],
    }
    this.baseUrl = joinUrl(this.options.url, this.options.prefix)
  }

  /** Add a folder. `itemGroup.item` holds its requests. Without an `id`, one is derived from the name. */
  addItemGroup = (itemGroup: Record<string, any>) => {
    if (!Array.isArray(itemGroup.item)) itemGroup.item = []
    itemGroup.id = this.stableId(itemGroup.id, `folder\n${itemGroup.name}`, this.data.info._postman_id)
    this.data.item.push(itemGroup)
  }

  /**
   * Add a request to the folder with the given id (or name). `request.request.url` is the
   * route path; it is prefixed with `url`, `prefix` and the folder's `prefix`.
   * Without a matching folder the request is added at the top level. Without an `id`, one is
   * derived from the folder, the method and the URL.
   */
  addItemGroupItem = (request: Record<string, any>, itemGroup: string) => {
    const groups: Record<string, any>[] = this.data.item.filter(
      (obj: Record<string, any>) => Array.isArray(obj.item)
    )
    const group =
      groups.find((obj) => obj.id === itemGroup) ||
      groups.find((obj) => obj.name === itemGroup)
    request.request.url = joinUrl(this.baseUrl, group?.prefix, request.request.url)
    request.id = this.stableId(
      request.id,
      `${request.request.method}\n${request.request.url}`,
      group?.id || this.data.info._postman_id
    )
    if (group) group.item.push(request)
    else this.data.item.push(request)
  }

  /** `id` if given, else a UUID v5 of `name` under `parent`; a repeated name gets a counter. */
  private stableId(id: string | undefined, name: string, parent: string): string {
    if (id) {
      this.ids.add(id)
      return id
    }
    let next = uuidV5(name, parent)
    for (let n = 2; this.ids.has(next); n++) next = uuidV5(`${name}\n${n}`, parent)
    this.ids.add(next)
    return next
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
