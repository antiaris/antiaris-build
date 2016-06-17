/**
 * Copyright (C) 2016 yanni4night.com
 * noop-transformer.js
 *
 * changelog
 * 2016-06-17[17:04:37]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');
const less = require('less');
const extend = require('lodash/extend');
const {
    error
} = require('antiaris-logger');

class LessTransformer extends Transformer {
    constructor() {
        super();
    }
    _transform(seed) {
        let {
            file,
            content
        } = seed;
        return new Promise(resolve => {
            less.render(content, {
                filename: file,
                compress: true
            }, (err, output) => {
                if (err) {
                    error(`LessTransformer error: ${err.message}`);
                    resolve(seed);
                } else {
                    resolve(extend({}, seed, {
                        content: output.css
                    }));
                }
            });
        });
    }
}

module.exports = LessTransformer;