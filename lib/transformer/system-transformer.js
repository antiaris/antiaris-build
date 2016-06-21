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
const {
    CWD,
    NAMESPACE
} = require('../config');
const {
    L
} = require('../shortcut');
const {
    warn
} = require('antiaris-logger');

class SystemTransformer extends Transformer {
    _transform(file) {
        let {
            filename,
            content,
            moduleId
        } = file;
        return new Promise((resolve, reject) => {

            c2s.transform(content, {
                moduleId,
                filename,
                translateDep: dep => {
                    let p = nodeResolve.resolve(L(filename), dep);
                    if (!p) {
                        const errMsg =
                            `SystemTransform error in ${filename}: dependency "${dep}" not found`;
                        if (this.options.isStrict) {
                            throw new Error(errMsg);
                        } else if (!this.options.isSlient) {
                            warn(errMsg);
                        }
                        return;
                    }
                    return `${NAMESPACE}:` + path.relative(CWD, p);
                }
            }, (err, result) => {
                if (err) {
                    if (this.options.isStrict) {
                        reject(err);
                    } else {
                        if (!this.options.isSlient) {
                            warn(`SystemTransform error in ${filename}: ${err.message}`);
                        }
                        resolve(file);
                    }
                } else {

                    file.setResource('deps', result.deps);

                    resolve(file.update(result.code));
                }
            });
        });
    }
}

module.exports = SystemTransformer;