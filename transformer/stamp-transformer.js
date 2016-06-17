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
const extend = require('lodash/extend');
const nodeResolve = require('antiaris-node-resolve');
const {
    L,
    NAMESPACE
} = require('../lib/config');

const {
    filestamp
} = require('antiaris-filestamp');

class StampTransformer extends Transformer {
    constructor(resourceMap) {
        super();
        this.resourceMap = resourceMap;
    }
    _transform(seed) {
        let {
            file,
            content
        } = seed;
        return new Promise((resolve, reject) => {
            let {
                filename
            } = filestamp.sync(L(file));

            const moduleId = `${NAMESPACE}:${file}`;

            filename = filename.replace(/\.jsx$/i, '.js');
            filename = filename.replace(/\.less$/i, '.css');

            this.resourceMap[moduleId] = this.resourceMap[moduleId] || {};
            this.resourceMap[moduleId].uri = `${NAMESPACE}/${filename}`;

            resolve(extend({}, seed, {
                file: `../static/${filename}`
            }));
        });
    }
}

module.exports = StampTransformer;