import { ModuleMetadata, Type } from "@nestjs/common"
export interface PostmanOptions {
  isGlobal?: boolean
  url: string
  prefix: string
  filePath?: string
  collectionName: string
  description: string
}

export interface PostmanAsyncOptionsFactory {
  createPostmanOptions(): Promise<PostmanOptions> | PostmanOptions
}

export interface PostmanAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<PostmanOptions>
  useClass?: Type<PostmanAsyncOptionsFactory>
  useFactory?: (...args: any[]) => Promise<PostmanOptions> | PostmanOptions
  inject?: any[]
}
