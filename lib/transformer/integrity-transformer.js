/**
 * Copyright (C) 2016 yanni4night.com
 * integrity-transformer.js
 *
 * changelog
 * 2016-06-17[23:28:09]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');
const crypto = require('crypto');
const {
    NAMESPACE
} = require('../config');

class IntegrityTransformer extends Transformer {
    constructor(resourceMap, isStrict) {
        super(isStrict);
        this.resourceMap = resourceMap;
    }
    _transform(seed) {
        let {
            content,
            file
        } = seed;
        const moduleId = `${NAMESPACE}:${file}`;
        return new Promise(resolve => {
            const sum = crypto.createHash('sha384').update(content).digest().toString('base64');
            this.resourceMap[moduleId] = this.resourceMap[moduleId] || {};
            this.resourceMap[moduleId].integrity = `sha384-${sum}`;
            resolve(seed);
        });
    }
}

module.exports = IntegrityTransformer;