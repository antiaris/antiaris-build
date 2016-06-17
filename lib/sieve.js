/**
 * Copyright (C) 2016 yanni4night.com
 * sieve.js
 *
 * changelog
 * 2016-06-16[18:16:46]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const glob = require('glob');
const fs = require('fs');
const {
    isBinary,
    W,
    R,
    OUTPUT
} = require('./config');
const minimatch = require('minimatch');
const {
    info,
    debug,
    warn,
    error
} = require('antiaris-logger');

class Sieve {
    constructor() {
        this.patterns = [];
    }
    hook(pattern, fn) {
        this.patterns.push({
            pattern,
            fn
        });
    }
    build(cwd) {
        return new Promise((resolve, reject) => {
            glob('**/*.*', {
                cwd: cwd
            }, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        }).then(files => {
            const fileTasks = files.map(file => {
                return new Promise((resolve, reject) => {
                    R(file, isBinary(file)).then(content => {
                        resolve(content);
                    }, reject);
                }).then(content => {
                    const originContent = content;
                    let newWritableFiles = [];
                    return new Promise((resolve, reject) => {
                        let i = 0;

                        const popHook = () => {
                            if (i === this.patterns.length) {
                                // origin file content
                                newWritableFiles.push({
                                    file,
                                    content: originContent
                                });
                                return resolve(newWritableFiles);
                            }
                            const {
                                pattern,
                                fn
                            } = this.patterns[i];

                            i += 1;
                            if (minimatch(file, pattern)) {
                                fn({
                                    file,
                                    content
                                }).then(result => {
                                    content = result.content;
                                    const nwf = Array.isArray(result.writableFiles) ?
                                        result.writableFiles : [];
                                    newWritableFiles.push(...nwf);
                                    popHook();
                                }).catch(reject);
                            } else {
                                popHook();
                            }
                        };

                        popHook();

                    });
                }).then(newWritableFiles => {
                    const tasks = newWritableFiles.map(newFile => {
                        return W(`${OUTPUT}/app/${newFile.file}`, newFile.content);
                    });
                    return Promise.all(tasks);
                });
            });
            return Promise.all(fileTasks);
        });
    }
}

module.exports = new Sieve();