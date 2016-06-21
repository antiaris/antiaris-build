/**
  * Copyright (C) 2016 yanni4night.com
  * filter-transformer.js
  *
  * changelog
  * 2016-06-21[15:36:26]:revised
  *
  * @author yanni4night@gmail.com
  * @version 1.0.0
  * @since 1.0.0
  */
'use strict';
const Transformer = require('./transformer');
const isString = require('lodash/isString');
const minimatch = require('minimatch');

class FilterTransformer extends Transformer {
    _transform(file) {
        const {pattern} = this.options;

        if (isString(pattern) && minimatch(file.filename, pattern)) {
            return Promise.resolve(file);
        } else {
            return new Promise(resolve => {
                resolve([]);
            });
        }
    }
}

module.exports = FilterTransformer;
