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
const extend = require('lodash/extend');
const {
    L
} = require('../lib/config');
const {
    error
} = require('antiaris-logger');

class BabelTransformer extends Transformer {
    _transform(seed) {
        let {
            file,
            content
        } = seed;
        return new Promise((resolve, reject) => {
            babel.transformFile(L(file), {
                extends: path.join(__dirname, '..', '.babelrc')
            }, (err, result) => {
                if (err) {
                    error(`BabelTransform error in ${file}: ${err.message}`);
                    resolve(seed);
                } else {
                    resolve(extend({}, seed, {
                        content: result.code
                    }));
                }
            });
        });
    }
}

module.exports = BabelTransformer;