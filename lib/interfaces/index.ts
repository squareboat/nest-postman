import { ModuleMetadata, Type } from "@nestjs/common"

export interface PostmanOptions {
  /** Register the module as global. */
  isGlobal?: boolean
  /** Base URL of the app, e.g. `http://localhost:3000` or a Postman variable like `{{baseUrl}}`. */
  url: string
  /** Global route prefix of the app (what you pass to `app.setGlobalPrefix()`), e.g. `v1`. */
  prefix?: string
  /** Directory to write `collection.json` to. Defaults to the current working directory. */
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
  useExisting?: Type<PostmanAsyncOptionsFactory>
  useClass?: Type<PostmanAsyncOptionsFactory>
  useFactory?: (...args: any[]) => Promise<PostmanOptions> | PostmanOptions
  inject?: any[]
}
