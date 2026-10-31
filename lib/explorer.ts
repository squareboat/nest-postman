import { Injectable, OnModuleInit, RequestMethod } from "@nestjs/common"
import { DiscoveryService, MetadataScanner } from "@nestjs/core"
import { METHOD_METADATA, PATH_METADATA } from "./constants"
import { PostmanService } from "./service"
import { groupName, joinUrl, toArray } from "./utils"

interface Folder {
  name: string
  paths: string[]
  requests: Record<string, any>[]
}

@Injectable()
export class PostmanExplorer implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly collection: PostmanService
  ) {}

  onModuleInit() {
    const folders: Folder[] = []
    for (const wrapper of this.discovery.getControllers()) {
      const { metatype } = wrapper
      if (typeof metatype !== "function" || !metatype.prototype) continue

      const controllerPaths = toArray<string>(
        Reflect.getMetadata(PATH_METADATA, metatype)
      )
      if (!controllerPaths.length) controllerPaths.push("/")

      const prototype = metatype.prototype
      const requests = this.metadataScanner
        .getAllMethodNames(prototype)
        .flatMap((key) => this.lookupRoutes(prototype[key], key, controllerPaths))
      // controllers without HTTP routes (e.g. only @MessagePattern() handlers) get no folder
      if (!requests.length) continue

      folders.push({
        name: groupName(wrapper.name || metatype.name),
        paths: controllerPaths,
        requests,
      })
    }

    const names = uniqueNames(folders)
    folders.forEach((folder, i) => {
      const group: Record<string, any> = {
        id: undefined, // set by PostmanService, stable across starts
        name: names[i],
        item: [],
      }
      this.collection.addItemGroup(group)
      for (const request of folder.requests) {
        this.collection.addItemGroupItem(request, group.id)
      }
    })
    this.collection.printCollection()
  }

  /** The requests of one controller method (one per controller path and route path). */
  lookupRoutes(
    handler: (...args: any[]) => any,
    key: string,
    controllerPaths: string[]
  ): Record<string, any>[] {
    if (!Reflect.hasOwnMetadata(METHOD_METADATA, handler)) return []
    const method = toPostmanMethod(Reflect.getMetadata(METHOD_METADATA, handler))
    const routePaths = toArray<string>(Reflect.getMetadata(PATH_METADATA, handler))
    if (!routePaths.length) routePaths.push("/")

    return controllerPaths.flatMap((controllerPath) =>
      routePaths.map((routePath) => ({
        id: undefined, // set by PostmanService, stable across starts
        name: key,
        request: { url: joinUrl("", controllerPath, routePath), method },
      }))
    )
  }
}

/** `@All()` is not an HTTP method; export it as GET. */
function toPostmanMethod(method: RequestMethod | undefined): string {
  if (method === undefined || method === RequestMethod.ALL) return "GET"
  return RequestMethod[method] || "GET"
}

/**
 * Folder names, unique: controllers that would share a name get their path added
 * ("Users (users)", "Users (admin/users)"), and a name that still repeats gets a counter.
 */
function uniqueNames(folders: Folder[]): string[] {
  const count = new Map<string, number>()
  for (const { name } of folders) count.set(name, (count.get(name) || 0) + 1)
  const named = folders.map(({ name, paths }) =>
    (count.get(name) || 0) > 1
      ? `${name} (${paths.map((p) => joinUrl("", p).slice(1) || "/").join(", ")})`
      : name
  )
  const seen = new Map<string, number>()
  return named.map((name) => {
    const n = (seen.get(name) || 0) + 1
    seen.set(name, n)
    return n > 1 ? `${name} (${n})` : name
  })
}
