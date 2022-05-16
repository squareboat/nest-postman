import { ModuleMetadata, Type } from '@nestjs/common';
import { QueueDriver } from '@squareboat/nest-queue-strategy';

export interface QueueDriverOptions {
  driver: Type<QueueDriver>;
  [key: string]: string | number | Record<string, any>;
}

export interface PostmanOptions {
  isGlobal?: boolean;
  url: string;
  prefix: string;
}

export interface PostmanAsyncOptionsFactory {
  createPostmanOptions(): Promise<PostmanOptions> | PostmanOptions;
}

export interface PostmanAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<PostmanOptions>;
  useClass?: Type<PostmanAsyncOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<PostmanOptions> | PostmanOptions;
  inject?: any[];
}
