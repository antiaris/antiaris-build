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
const extend = require('lodash/extend');
const {
    NAMESPACE
} = require('../config');

const {
    contentstamp
} = require('antiaris-filestamp');

class StampTransformer extends Transformer {
    constructor(resourceMap, isStrict) {
        super(isStrict);
        this.resourceMap = resourceMap;
    }
    _transform(seed) {
        let {
            file,
            content
        } = seed;
        return new Promise(resolve => {
            let {
                filename
            } = contentstamp.sync(content, file);

            const moduleId = `${NAMESPACE}:${file}`;

            filename = filename.replace(/\.jsx$/i, '.js');
            filename = filename.replace(/\.less$/i, '.css');

            this.resourceMap[moduleId] = this.resourceMap[moduleId] || {};
            this.resourceMap[moduleId].uri = `${NAMESPACE}/${filename}`;

            resolve(extend({}, seed, {
                file: `../static/${NAMESPACE}/${filename}`
            }));
        });
    }
}

module.exports = StampTransformer;