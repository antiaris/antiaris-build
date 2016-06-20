/**
 * Copyright (C) 2016 yanni4night.com
 * read-transformer.js
 *
 * changelog
 * 2016-06-19[08:41:50]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */

'use strict';

const Transformer = require('./transformer');

const {
  isBinary,
  R
} = require('../config');
const isUndefined = require('lodash/isNil');

class ReadTransformer extends Transformer {
  transform(...args) {
    // Ignore content===undefined
    return this._transform(...args);
  }
  _transform(file) {
    const {
      filename,
      content
    } = file;
    // use cache if possible
    if (!isUndefined(content)) {
      return Promise.resolve(file);
    } else {
      return R(filename, isBinary(filename)).then(content => {
        // Must return origin
        return file.update(content);
      });
    }
  }
}

module.exports = ReadTransformer;