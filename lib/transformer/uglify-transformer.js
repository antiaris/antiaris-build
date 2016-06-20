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
const {
    warn
} = require('antiaris-logger');

class UglifyTransformer extends Transformer {
    _transform(file) {
        const {
            filename,
            content
        } = file;
        return new Promise((resolve, reject) => {
            try {
                const result = uglify.minify(content, {
                    fromString: true,
                    output: {
                        ascii_only: true,
                        max_line_len: 3000
                    }
                });
                resolve(file.update(result.code));
            } catch (err) {
                if (this.options.isStrict) {
                    reject(err);
                } else {
                    warn(`UglifyTransform error in ${filename}: ${err.message}`);
                    resolve(file);
                }
            }
        });
    }
}

module.exports = UglifyTransformer;