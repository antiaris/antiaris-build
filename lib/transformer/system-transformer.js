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
} = require('../config');
const {
    warn
} = require('antiaris-logger');

class SystemTransformer extends Transformer {
    _transform(seed, resourceMap) {
        let {
            file,
            content,
            moduleId
        } = seed;
        return new Promise((resolve, reject) => {

            c2s.transform(content, {
                moduleId,
                translateDep: dep => {
                    let p = nodeResolve.resolve(L(file), dep);
                    if (!p) {
                        warn(`SystemTransform error in ${file}: dependency "${dep}" not found`);
                        return;
                    }
                    return `${NAMESPACE}:` + path.relative(CWD, p);
                }
            }, (err, result) => {
                if (err) {
                    if (this.options.isStrict) {
                        reject(err);
                    } else {
                        warn(`SystemTransform error in ${file}: ${err.message}`);
                        resolve(seed);
                    }
                } else {
                    resourceMap[moduleId] = resourceMap[moduleId] || {};
                    resourceMap[moduleId].deps = result.deps;

                    resolve(extend({}, seed, {
                        content: result.code
                    }));
                }
            });
        });
    }
}

module.exports = SystemTransformer;