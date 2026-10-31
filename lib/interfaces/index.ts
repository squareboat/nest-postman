import { ModuleMetadata, Type } from "@nestjs/common"
export interface PostmanOptions {
  isGlobal?: boolean
  /** Base URL of the app, e.g. `http://localhost:3000` or a Postman variable like `{{baseUrl}}`. */
  url: string
  /** Global route prefix of the app (what you pass to `app.setGlobalPrefix()`), e.g. `v1`. */
  prefix?: string
  filePath?: string
  collectionName: string
  description: string
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
