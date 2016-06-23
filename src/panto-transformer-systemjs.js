/**
 * Copyright (C) 2016 antiaris.xyz
 * panto-transformer-systemjs.js
 *
 * changelog
 * 2016-06-23[15:03:00]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('panto-transformer');
const c2s = require('antiaris-transform-commonjs-modules-systemjs');
const path = require('path');
const nodeResolve = require('node-resolve');

class SystemjsTransformer extends Transformer {
    _transform(file) {
        let {
            filename,
            content
        } = file;

        let {
            ignoreError,
            cwd,
            namespace
        } = this.options;

        return new Promise((resolve, reject) => {
            c2s.transform(content, {
                moduleId: namespace + ':' + filename,
                filename,
                translateDep: dep => {
                    let p = nodeResolve.resolve(panto.file.locate(filename), dep);
                    if (!p) {
                        const errMsg =
                            `SystemjsTransform warnning in ${filename}: dependency "${dep}" not found`;
                        if (ignoreError) {
                            panto.log.warn(errMsg);

                        } else {
                            throw new Error(errMsg);
                        }
                        return;
                    }
                    return namespace + ':' + path.relative(cwd, p);
                }
            }, (err, result) => {
                if (err) {
                    if (ignoreError) {
                        panto.log.warn(`SystemTransform warnning in ${filename}: ${err.message}`);
                        resolve(file);
                    } else {
                        reject(err);
                    }
                } else {
                    resolve(panto.util.extend(file, {
                        deps: result.deps,
                        content: result.code
                    }));
                }
            });
        });
    }
}

module.exports = SystemjsTransformer;