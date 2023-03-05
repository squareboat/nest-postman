import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { POSTMAN_OPTIONS } from './constants';
import { PostmanOptions } from './interfaces';

@Injectable()
export class PostmanService {
  private static data: Record<string, any>;
  private static baseUrl: string;
  constructor(@Inject(POSTMAN_OPTIONS) private options:PostmanOptions) {
    PostmanService.data = {
      info: {
        name: process.env.APP_NAME,
        version: 'v2.0.0',
        description: 'This is a demo collection.',
        schema: 'https://schema.getpostman.com/json/collection/v2.0.0/',
      },
      item: [],
    };
    PostmanService.baseUrl = this.options.url+this.options.prefix;
    // console.log(PostmanService.baseUrl);
  }


  addItemGroup = (itemGroup: Record<string, any>) => {
    if (!PostmanService.data.item) {
      PostmanService.data.item = [itemGroup];
    } else {
      PostmanService.data['item'].push(itemGroup);
    }
  };

  addItemGroupItem = (request: Record<string, any>, itemName: string) => {
    if (!PostmanService.data.item) {
      request.request.url = PostmanService.baseUrl + '/' + request.request.url;
      PostmanService.data.item = [request];
    } else {
      const itemGroups = PostmanService.data.item.filter(
        (obj) => obj.name === itemName,
      );
      if (!itemGroups.length) {
        console.log('huhb');
        request.request.url =
          PostmanService.baseUrl + '/' + request.request.url;
        PostmanService.data.item.push(request);
      } else {
        const itemGroup = itemGroups[0];
        const items = itemGroup.item;
        items.push(request);
        request.request.url =
          PostmanService.baseUrl +
          '/' +
          itemGroup.prefix +
          '/' +
          request.request.url;
        PostmanService.data.item = PostmanService.data.item.map((obj) => {
          if (obj.name === itemGroup.name) {
            return {
              ...obj,
              item: items,
            };
          }
          return obj;
        });
      }
    }
  };

  printCollection = () => {
    const collectionPath = 'collection.json';
    fs.writeFileSync(collectionPath, JSON.stringify(PostmanService.data), {
      flag: 'w+',
    });

    let total = 0;
    PostmanService.data.item.forEach((obj) => {
      if (obj.item) {
        total += obj.item.length;
      }
    });
    // console.log(total);
  };
}
