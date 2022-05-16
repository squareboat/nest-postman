import {
  DynamicModule,
  INestApplication,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { POSTMAN_OPTIONS } from './constants';
import { PostmanExplorer } from './explorer';
import {
  PostmanAsyncOptions,
  PostmanAsyncOptionsFactory,
  PostmanOptions,
} from './interfaces';
import { PostmanService } from './service';
import { getGlobalPrefix } from './utils';

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
      providers: [{ provide: POSTMAN_OPTIONS, useValue: options },PostmanService, PostmanExplorer ],
    };
  }

  /**
   * Register Async Options
   */
  static registerAsync(options: PostmanAsyncOptions): DynamicModule {
    return {
      module: PostmanModule,
      imports: [DiscoveryModule],
      providers: [this.createPostmanOptionsProvider(options),PostmanService, PostmanExplorer ],
    };
  }
  private static createPostmanOptionsProvider(
    options: PostmanAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: POSTMAN_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const inject = [
      (options.useClass || options.useExisting) as Type<PostmanOptions>,
    ];

    return {
      provide: POSTMAN_OPTIONS,
      useFactory: async (optionsFactory: PostmanAsyncOptionsFactory) =>
        await optionsFactory.createPostmanOptions(),
      inject,
    };
  }
}
