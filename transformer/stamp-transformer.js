/**
 * Copyright (C) 2016 yanni4night.com
 * stamp-transformer.js
 *
 * changelog
 * 2016-06-17[14:19:57]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');
const path = require('path');
const nodeResolve = require('antiaris-node-resolve');
const {
    L,
    NAMESPACE
} = require('../lib/config');

const {
    filestamp
} = require('antiaris-filestamp');

class StampTransformer extends Transformer {
    _transform({file, content}) {
        return new Promise((resolve, reject) => {
            const {filename} = filestamp.sync(L(file));

            const moduleId = `${NAMESPACE}:${file}`;

            resourceMap[moduleId] = {
                uri: `${NAMESPACE}/${filename}`,
                deps: []
            };
            resolve({file, content});
        });
    }
}

module.exports = StampTransformer;