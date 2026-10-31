import { DynamicModule, Module, Provider, Type } from "@nestjs/common"
import { DiscoveryModule } from "@nestjs/core"
import { POSTMAN_OPTIONS } from "./constants"
import { PostmanExplorer } from "./explorer"
import {
  PostmanAsyncOptions,
  PostmanAsyncOptionsFactory,
  PostmanOptions,
} from "./interfaces"
import { PostmanService } from "./service"

@Module({})
export class PostmanModule {
  /**
   * Register options
   * @param options
   */
  static register(options: PostmanOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: PostmanModule,
      imports: [DiscoveryModule],
      providers: [
        { provide: POSTMAN_OPTIONS, useValue: options },
        PostmanService,
        PostmanExplorer,
      ],
      exports: [PostmanService],
    }
  }

  /**
   * Register Async Options
   */
  static registerAsync(options: PostmanAsyncOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: PostmanModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [
        this.createPostmanOptionsProvider(options),
        ...(options.useClass
          ? [{ provide: options.useClass, useClass: options.useClass }]
          : []),
        PostmanService,
        PostmanExplorer,
      ],
      exports: [PostmanService],
    }
  }

  private static createPostmanOptionsProvider(
    options: PostmanAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: POSTMAN_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      }
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<PostmanAsyncOptionsFactory>,
    ]

    return {
      provide: POSTMAN_OPTIONS,
      useFactory: async (optionsFactory: PostmanAsyncOptionsFactory) =>
        await optionsFactory.createPostmanOptions(),
      inject,
    }
  }
}
