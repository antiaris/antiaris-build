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
            let fo = [];
            if (Array.isArray(arr)) {
                arr.forEach(item => {
                    if (Array.isArray(item)) {
                        fo.push(...item);
                    } else {
                        fo.push(item);
                    }
                });
            } else {
                fo = arr;
            }
            return fo;
        });
    }
    _transform(obj) {
        return Promise.resolve(obj);
    }
}

module.exports = Transformer;