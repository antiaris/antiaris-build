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
const extend = require('lodash/extend');
const isString = require('lodash/isString');
const minimatch = require('minimatch');

class IgnoreTransformer extends Transformer {
    _transform(seed) {
        const {exclude} = this.options;
        if (isString(exclude) && !minimatch(seed.filename, exclude)) {
            return Promise.resolve(seed);
        } else {
            return new Promise(resolve => {
                resolve(extend({}, seed, {
                    content: null
                }));
            });
        }
    }
}

module.exports = IgnoreTransformer;