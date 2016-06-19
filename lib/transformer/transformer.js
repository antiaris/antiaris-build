/**
 * Copyright (C) 2016 yanni4night.com
 * transformer.js
 *
 * changelog
 * 2016-06-17[14:09:17]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const flattenDeep = require('lodash/flattenDeep')
const extend = require('lodash/extend');
const isPlainObject = require('lodash/isPlainObject');
const isNil = require('lodash/isNil');

class Transformer {
    constructor(opt) {
        if (!isNil(opt) && !isPlainObject(opt)) {
            throw new Error(`A PLAIN OBJECT is required to construct a transformer`);
        }
        this.options = extend({}, opt);
    }
    transform(...args) {
        return this._transform(...args).then(arr => {
            return flattenDeep(Array.isArray(arr) ? arr : [arr]);
        });
    }
    _transform(seed/*, resourceMap*/) {
        return Promise.resolve(seed);
    }
}

module.exports = Transformer;