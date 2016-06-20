/**
 * Copyright (C) 2016 yanni4night.com
 * ignore-transformer.js
 *
 * changelog
 * 2016-06-18[00:28:54]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');
const isString = require('lodash/isString');
const minimatch = require('minimatch');

class IgnoreTransformer extends Transformer {
    _transform(file) {
        const {exclude} = this.options;
        if (isString(exclude) && !minimatch(file.filename, exclude)) {
            return Promise.resolve(file);
        } else {
            return new Promise(resolve => {
                resolve(file.truncate());
            });
        }
    }
}

module.exports = IgnoreTransformer;