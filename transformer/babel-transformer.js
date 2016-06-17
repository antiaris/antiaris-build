/**
 * Copyright (C) 2016 yanni4night.com
 * babel-transformer.js
 *
 * changelog
 * 2016-06-17[14:08:31]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');
const babel = require('babel-core');
const path = require('path');
const {L} = require('../lib/config');
const {error} = require('antiaris-logger');

class BabelTransformer extends Transformer {
    _transform({
        file,
        content
    }) {
        return new Promise((resolve, reject) => {
            babel.transformFile(L(file), {
                extends: path.join(__dirname, '.babelrc')
            }, (err, result) => {
                if (err) {
                    error(`Transform ES6 error in ${file}: ${err.message}`);
                    resolve({
                        content
                    });
                } else {
                    resolve({
                        content: result.code
                    });
                }
            });
        });
    }
}

module.exports = BabelTransformer;