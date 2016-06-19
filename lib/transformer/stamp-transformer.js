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
    _transform(seed, resourceMap) {
        let {
            file,
            content,
            moduleId
        } = seed;
        return new Promise(resolve => {
            let {
                filename
            } = contentstamp.sync(content, file);

            filename = filename.replace(/\.jsx$/i, '.js');
            filename = filename.replace(/\.less$/i, '.css');

            resourceMap[moduleId] = resourceMap[moduleId] || {};
            resourceMap[moduleId].uri = `${NAMESPACE}/${filename}`;

            resolve(extend({}, seed, {
                file: `../static/${NAMESPACE}/${filename}`
            }));
        });
    }
}

module.exports = StampTransformer;