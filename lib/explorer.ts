import { Injectable, OnModuleInit } from "@nestjs/common"
import { DiscoveryService, MetadataScanner } from "@nestjs/core"
import { Methods } from "./constants"
import { PostmanService } from "./service"
import { groupName } from "./utils"
import * as crypto from 'crypto'

@Injectable()
export class PostmanExplorer implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly collection: PostmanService
  ) {
  }

  async onModuleInit() {
    const wrappers = this.discovery.getControllers()
    wrappers.forEach((w: Record<string, any>) => {
      const { instance, name } = w
      if (
        !instance ||
        typeof instance === "string" ||
        !Object.getPrototypeOf(instance)
      ) {
        return
      }
      const moduleName = groupName(name)
      this.collection.addItemGroup({
        id: crypto.randomUUID(),
        name: moduleName,
        prefix: Reflect.getMetadata("path", w["token"] as Object),
        item: [],
      })
      for (const key of this.metadataScanner.getAllMethodNames(
        Object.getPrototypeOf(instance)
      )) {
        this.lookupRoutes(instance, key, moduleName)
      }
    })
    this.collection.printCollection()
  }

  lookupRoutes(
    instance: Record<string, () => any>,
    key: string,
    groupName: string
  ) {
    const isMethod = Reflect.hasOwnMetadata("method", instance[key])
    if (!isMethod) return
    const method = Reflect.getMetadata("method", instance[key])
    const path = Reflect.getMetadata("path", instance[key])

    this.collection.addItemGroupItem(
      {
        id: crypto.randomUUID(),
        name: key,
        request: {
          url: path,
          method: Methods[method],
        },
      },
      groupName
    )
  }
}
