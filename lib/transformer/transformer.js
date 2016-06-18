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

class Transformer {
    constructor(isStrict) {
        this.isStrict = isStrict;
        this.nexts = [];
    }
    next(...transformers) {
        this.nexts.push(...transformers);
        return this;
    }
    transform(obj) {
        const p = this._transform(obj);
        return (this.nexts.length ? Promise.all(this.nexts.map(next => {
            return p.then(o => {
                return next.transform(o);
            });
        })) : p).then(arr => {
            return flattenDeep(Array.isArray(arr) ? arr : [arr]);
        });
    }
    _transform(obj) {
        return Promise.resolve(obj);
    }
}

module.exports = Transformer;