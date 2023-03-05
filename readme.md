# NestJS Postman

Postman Collection Generator for NestJS Rest API.

## Table of Content

- [NestJS Postman](#nest-postman)
  - [Table of Content](#table-of-content)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
    - [Static Registration](#static-registration)
    - [Recommended Way](#recommended-way)
  - [Usage](#usage)
  - [License](#license)


## Introduction

This library provides a simple way to generate a Postman collection for your NestJS Rest API app. With this library, you can easily export your API endpoints as a Postman collection, allowing you to test your API with Postman.

---

## Installation

```python
#Using NPM
npm i nest-postman

#Using YARN
yarn i nest-postman
```

---

## Getting Started

To register `PostmanModule` with your app, import the module inside `AppModule` (your root module).

#### Static Registration

> `PostmanModule` is added to global scope.

```typescript
import { Module } from '@nestjs/common';
import { PostmanModule } from 'nest-postman'

@Module({
  imports: [
    PostmanModule.register({
      collectionName: process.env.APP_NAME || 'NestJS App',
      url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT}/`,
      prefix: 'v1',
      filePath: '',
      description: 'This is my collection.'
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
```

#### Recommended Way

Use `ConfigModule` provided by NestJS to load configurations. To learn about `ConfigModule`, [click here](https://docs.nestjs.com/techniques/configuration).

**#1. Create postman.ts file**

```typescript
import { PostmanOptions } from 'nest-postman/interfaces';
import { registerAs } from '@nestjs/config';
export default registerAs(
  'postman',
  () =>
    ({
      collectionName: process.env.APP_NAME || 'NestJS App',
      url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT}/`,
      prefix: 'v1',
      filePath: '',
      description: 'This is my collection.',
    } as PostmanOptions),
);
```

**#2. Register ConfigModule**

```typescript
import { Module } from "@nestjs/common";
import postman from "@config/fileystem";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      load: [postman],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```



**#3. Register Async StorageModule**
Add following snippet to the `imports` array. `ConfigService` is importable from `@nestjs/config` module.

```typescript
 PostmanModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => config.get('postman'),
      inject: [ConfigService],
    })
```

---
## Usage

As soon as you run your app, there will be a file created with name collection.json in your project directory. Use that file to import in your postman application and *HOLA*, your postman collection is ready for use.


### License
This library is licensed under the MIT License.
