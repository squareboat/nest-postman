import { Injectable, OnModuleInit, RequestMethod } from "@nestjs/common"
import { DiscoveryService, MetadataScanner } from "@nestjs/core"
import * as crypto from "crypto"
import { METHOD_METADATA, PATH_METADATA } from "./constants"
import { PostmanService } from "./service"
import { groupName, joinUrl, toArray } from "./utils"

@Injectable()
export class PostmanExplorer implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly collection: PostmanService
  ) {}

  onModuleInit() {
    for (const wrapper of this.discovery.getControllers()) {
      const { metatype } = wrapper
      if (typeof metatype !== "function" || !metatype.prototype) continue

      const group = {
        id: crypto.randomUUID(),
        name: groupName(wrapper.name || metatype.name),
        item: [],
      }
      this.collection.addItemGroup(group)

      const controllerPaths = toArray<string>(
        Reflect.getMetadata(PATH_METADATA, metatype)
      )
      if (!controllerPaths.length) controllerPaths.push("/")

      const prototype = metatype.prototype
      for (const key of this.metadataScanner.getAllMethodNames(prototype)) {
        this.lookupRoutes(prototype[key], key, group.id, controllerPaths)
      }
    }
    this.collection.printCollection()
  }

  lookupRoutes(
    handler: (...args: any[]) => any,
    key: string,
    groupId: string,
    controllerPaths: string[]
  ) {
    if (!Reflect.hasOwnMetadata(METHOD_METADATA, handler)) return
    const method = toPostmanMethod(Reflect.getMetadata(METHOD_METADATA, handler))
    const routePaths = toArray<string>(Reflect.getMetadata(PATH_METADATA, handler))
    if (!routePaths.length) routePaths.push("/")

    for (const controllerPath of controllerPaths) {
      for (const routePath of routePaths) {
        this.collection.addItemGroupItem(
          {
            id: crypto.randomUUID(),
            name: key,
            request: { url: joinUrl("", controllerPath, routePath), method },
          },
          groupId
        )
      }
    }
  }
}

/** `@All()` is not an HTTP method; export it as GET. */
function toPostmanMethod(method: RequestMethod | undefined): string {
  if (method === undefined || method === RequestMethod.ALL) return "GET"
  return RequestMethod[method] || "GET"
}
