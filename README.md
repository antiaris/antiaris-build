# antiaris-build
[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency status][david-dm-image]][david-dm-url] [![Dev Dependency status][david-dm-dev-image]][david-dm-dev-url]

Build script for [antiaris](https://github.com/antiaris) project. **Need Node.js >= v7**

## install

>npm install antiaris-build -g

## usage

>$antiaris-build

In your project directory, an _antiaris.yml_ file is required like:

```yaml
namespace: client
url:
  static_prefix: '/s?'
src: src
output: output
ignore: package.json,*.md,LICENSE,AUTHORS,bower.json
binary_resource: webp,png,jpg,jpeg,gif,bmp,swf,woff,woff2,ttf,eot,otf,cur
```

[npm-url]: https://npmjs.org/package/antiaris-build
[downloads-image]: http://img.shields.io/npm/dm/antiaris-build.svg
[npm-image]: http://img.shields.io/npm/v/antiaris-build.svg
[travis-url]: https://travis-ci.org/antiaris/antiaris-build
[travis-image]: http://img.shields.io/travis/antiaris/antiaris-build.svg
[david-dm-url]:https://david-dm.org/antiaris/antiaris-build
[david-dm-image]:https://david-dm.org/antiaris/antiaris-build.svg
[david-dm-dev-url]:https://david-dm.org/antiaris/antiaris-build#type=dev
[david-dm-dev-image]:https://david-dm.org/antiaris/antiaris-build/dev-status.svg