/**
 * Copyright (C) 2016 yanni4night.com
 * system-transformer.js
 *
 * changelog
 * 2016-06-17[14:15:24]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');
const c2s = require('antiaris-transform-commonjs-modules-systemjs');
const path = require('path');
const nodeResolve = require('antiaris-node-resolve');
const extend = require('lodash/extend');
const {
    L,
    CWD,
    NAMESPACE
} = require('../lib/config');
const {
    error
} = require('antiaris-logger');

class SystemTransformer extends Transformer {
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
            const moduleId = `${NAMESPACE}:${file}`;

            c2s.transform(content, {
                moduleId,
                translateDep: dep => {
                    let p = nodeResolve.resolve(L(file), dep);
                    if (!p) {
                        warn(`Dependency "${dep}" not found for ${file}`);
                        return;
                    }
                    return `${NAMESPACE}:` + path.relative(CWD, p);
                }
            }, (err, result) => {
                if (err) {
                    error(`SystemTransform "${file}" error: ${err.message}`);
                    return resolve(seed);
                } else {
                    this.resourceMap[moduleId] = this.resourceMap[moduleId] || {};
                    this.resourceMap[moduleId].deps = result.deps;

                    return resolve(extend({}, seed, {
                        content: result.code
                    }));
                }
            });
        });
    }
}

module.exports = SystemTransformer;