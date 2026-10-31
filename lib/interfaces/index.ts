import { ModuleMetadata, Type } from "@nestjs/common"

export interface PostmanOptions {
  /** Register the module as global, so `PostmanService` can be injected in every module. */
  isGlobal?: boolean
  /** Base URL of the app, e.g. `http://localhost:3000` or a Postman variable like `{{baseUrl}}`. */
  url: string
  /** Global route prefix of the app (what you pass to `app.setGlobalPrefix()`), e.g. `v1`. */
  prefix?: string
  /**
   * Where to write the collection: a path ending in `.json` is the file itself (`postman/api.json`),
   * anything else is a directory that gets `collection.json`. Defaults to `./collection.json`.
   */
  filePath?: string
  /** Name of the collection in Postman. */
  collectionName: string
  /** Description of the collection. */
  description?: string
}

export interface PostmanAsyncOptionsFactory {
  createPostmanOptions(): Promise<PostmanOptions> | PostmanOptions
}

export interface PostmanAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  /** Register the module as global, so `PostmanService` can be injected in every module. */
  isGlobal?: boolean
  useExisting?: Type<PostmanAsyncOptionsFactory>
  useClass?: Type<PostmanAsyncOptionsFactory>
  useFactory?: (...args: any[]) => Promise<PostmanOptions> | PostmanOptions
  inject?: any[]
}
