# NestJS Postman

Postman collection generator for NestJS REST APIs.

## Table of Contents

- [NestJS Postman](#nestjs-postman)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
    - [Static Registration](#static-registration)
    - [Recommended Way](#recommended-way)
  - [Options](#options)
  - [Usage](#usage)
  - [Limitations](#limitations)
  - [License](#license)

## Introduction

This library generates a [Postman](https://www.postman.com/) collection from the controllers of your NestJS app. When the app starts, it reads the routes of every controller and writes them to a `collection.json` file (Postman Collection Format v2.1) that you can import into Postman.

---

## Installation

```bash
# Using NPM
npm i @squareboat/nest-postman

# Using YARN
yarn add @squareboat/nest-postman
```

Requires Node.js 20.19+ or 22.12+ and NestJS 10, 11 or 12.

> The unscoped `nest-postman` package on npm is an old, broken release of this library (it has no compiled code). Use `@squareboat/nest-postman`.

---

## Getting Started

To register `PostmanModule` with your app, import the module inside `AppModule` (your root module).

#### Static Registration

```typescript
import { Module } from '@nestjs/common';
import { PostmanModule } from '@squareboat/nest-postman';

@Module({
  imports: [
    PostmanModule.register({
      collectionName: process.env.APP_NAME || 'NestJS App',
      url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT || 3000}`,
      prefix: 'v1', // the global prefix of your app, if you use app.setGlobalPrefix('v1')
      filePath: 'postman', // writes postman/collection.json
      description: 'This is my collection.',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

The collection is a development tool. To leave it out of production builds, register the module only outside production:

```typescript
imports: [
  ...(process.env.NODE_ENV !== 'production'
    ? [PostmanModule.register({ collectionName: 'NestJS App', url: 'http://localhost:3000' })]
    : []),
],
```

#### Recommended Way

Use `ConfigModule` provided by NestJS to load configurations. To learn about `ConfigModule`, [click here](https://docs.nestjs.com/techniques/configuration).

**#1. Create postman.ts file**

```typescript
import { registerAs } from '@nestjs/config';
import { PostmanOptions } from '@squareboat/nest-postman';

export default registerAs(
  'postman',
  () =>
    ({
      collectionName: process.env.APP_NAME || 'NestJS App',
      url: process.env.APP_URL || `http://localhost:${process.env.APP_PORT || 3000}`,
      prefix: 'v1',
      filePath: 'postman',
      description: 'This is my collection.',
    }) as PostmanOptions,
);
```

**#2. Register ConfigModule**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import postman from './config/postman';

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

**#3. Register Async PostmanModule**

Add the following snippet to the `imports` array. `ConfigModule` and `ConfigService` are importable from `@nestjs/config`.

```typescript
PostmanModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => config.getOrThrow('postman'),
  inject: [ConfigService],
}),
```

List modules in `imports` (here `ConfigModule`), not providers such as `ConfigService`.

`registerAsync()` also accepts `useClass` or `useExisting` with a class that implements `PostmanAsyncOptionsFactory`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostmanAsyncOptionsFactory, PostmanOptions } from '@squareboat/nest-postman';

@Injectable()
export class PostmanConfig implements PostmanAsyncOptionsFactory {
  constructor(private config: ConfigService) {}

  createPostmanOptions(): PostmanOptions {
    return this.config.getOrThrow('postman');
  }
}

// in AppModule imports
PostmanModule.registerAsync({ imports: [ConfigModule], useClass: PostmanConfig }),
```

---

## Options

| Option           | Required | Description                                                                                                        |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `collectionName` | yes      | Name of the collection in Postman.                                                                                 |
| `url`            | yes      | Base URL of your app, e.g. `http://localhost:3000`. A Postman variable such as `{{baseUrl}}` works too.            |
| `prefix`         | no       | Global route prefix of your app (what you pass to `app.setGlobalPrefix()`), e.g. `v1`.                            |
| `filePath`       | no       | Directory to write `collection.json` to. It is created if missing. Defaults to the current working directory.     |
| `description`    | no       | Description of the collection.                                                                                     |
| `isGlobal`       | no       | Register the module as global, so `PostmanService` can be injected in every module. `registerAsync()` accepts it too. |

---

## Usage

When your app starts (`app.listen()` or `app.init()`), `collection.json` is written to `filePath` (or your project directory) and overwritten on every start. Import that file in the Postman app (**File > Import**) and *HOLA*, your Postman collection is ready for use.

The collection has one folder per controller (for example `UsersController` becomes `Users`) and one request per route, with its HTTP method and full URL. Route parameters stay as `:id`, which Postman shows as path variables. Routes declared with `@All()` are exported as `GET` requests.

If the file cannot be written (for example on a read-only file system), a warning is logged and the app starts as usual.

---

## Limitations

- Only the method and URL of each route are exported. Request bodies, query parameters and headers are not.
- The URL is built from `url`, `prefix`, the controller path and the route path. Paths added by `RouterModule`, URI versioning (`@Version()`), global prefix exclusions and controller `host` options are not included.

---

## License

This library is licensed under the MIT License.
