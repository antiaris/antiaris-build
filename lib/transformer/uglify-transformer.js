/**
 * Copyright (C) 2016 yanni4night.com
 * uglify-transformer.js
 *
 * changelog
 * 2016-06-17[20:13:03]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const Transformer = require('./transformer');
const uglify = require('uglify-js');
const extend = require('lodash/extend');
const {
    error
} = require('antiaris-logger');

class UglifyTransformer extends Transformer {
    constructor(isStrict) {
        super();
        this.isStrict = isStrict;
    }
    _transform(seed) {
        const {
            file,
            content
        } = seed;
        return new Promise((resolve, reject) => {
            try {
                const result = uglify.minify(content, {
                    fromString: true,
                    output: {
                        ascii_only: true,
                        max_line_len: 3000
                    }
                });
                resolve(extend({}, seed, {
                    content: result.code
                }));
            } catch (err) {
                if (this.isStrict) {
                    reject(err);
                } else {
                    error(`UglifyTransform error in ${file}: ${err.message}`);
                    resolve(seed);
                }
            }
        });
    }
}

module.exports = UglifyTransformer;