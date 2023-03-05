import { uuid } from '@libs/core';
import { Injectable, OnModuleInit, RequestMethod } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { lowerCase, upperFirst } from 'lodash';
import { PostmanService } from './service';
// import { JOB_NAME, JOB_OPTIONS } from './constants';
// import { QueueMetadata } from './metadata';

@Injectable()
export class PostmanExplorer implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly collection: PostmanService,
  ) {}

  onModuleInit() {
    const wrappers = this.discovery.getControllers();
    wrappers.forEach((w) => {
      const { instance, name } = w;
      if (
        !instance ||
        typeof instance === 'string' ||
        !Object.getPrototypeOf(instance)
      ) {
        return;
      }
      const moduleName = upperFirst(lowerCase(name)).replace(' controller', '');
      this.collection.addItemGroup({
        id: uuid(),
        name: moduleName,
        prefix: Reflect.getMetadata('path', w['token']),
        item: [],
      });
      //   console.log(Object.keys(w), Reflect.getMetadata('path', w['token']));
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => this.lookupRoutes(instance, key, moduleName),
      );
    });
    this.collection.printCollection();
  }

  lookupRoutes(
    instance: Record<string, Function>,
    key: string,
    groupName: string,
  ) {
    const methodRef = instance[key];

    const isMethod = Reflect.hasOwnMetadata('method', instance[key]);
    // console.log(Reflect.getOwnMetadataKeys(instance));
    if (!isMethod) return;
    const method = Reflect.getMetadata('method', instance[key]);
    const path = Reflect.getMetadata('path', instance[key]);
    // console.log(isMethod, method, path, methodRef, instance);
    const Methods = [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'ALL',
      'OPTIONS',
      'HEAD',
    ];
    this.collection.addItemGroupItem(
      {
        id: uuid(),
        name: key,
        request: {
          url: path,
          method: Methods[method],
        },
      },
      groupName,
    );
  }
}
