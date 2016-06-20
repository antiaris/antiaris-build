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
const {
    warn
} = require('antiaris-logger');

class LessTransformer extends Transformer {
    _transform(file) {
        let {
            filename,
            content
        } = file;
        return new Promise((resolve, reject) => {
            less.render(content, {
                filename,
                compress: true
            }, (err, output) => {
                if (err) {
                    if (this.options.isStrict) {
                        reject(err);
                    } else {
                        warn(`LessTransform error: ${err.message}`);
                        resolve(file);
                    }
                } else {
                    resolve(file.update(output.css));
                }
            });
        });
    }
}

module.exports = LessTransformer;