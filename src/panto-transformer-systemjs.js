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
            isSilent,
            ignoreError,
            cwd,
            namespace,
            exculde
        } = this.options;

        if (/\.json/i.test(filename)) {
            content = 'module.exports=' + content;
        }

        return new Promise((resolve, reject) => {

            if (exculde && panto.file.match(filename, exculde)) {
                return resolve(file);
            }

            c2s.transform(content, {
                isSilent,
                moduleId: namespace + ':' + filename,
                filename,
                translateDep: dep => {
                    let p = nodeResolve.resolve(filename, dep, panto.getOption('cwd'), true);
                    if (!p) {
                        const errMsg =
                            `SystemjsTransform warnning in ${filename}: dependency "${dep}" not found`;
                        if (ignoreError) {
                            if (!isSilent) {
                                panto.log.warn(errMsg);
                            }

                        } else {
                            throw new Error(errMsg);
                        }
                        return;
                    }
                    dep = path.relative(cwd, p);
                    panto.reportDependencies(filename, dep);
                    return namespace + ':' + dep;
                }
            }, (err, result) => {
                if (err) {
                    if (ignoreError) {
                        if (!isSilent) {
                            panto.log.warn(
                                `SystemTransform warnning in ${filename}: ${err.message}`);
                        }
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