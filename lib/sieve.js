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
                        resolve({
                            file,
                            content
                        });
                    }, reject);
                }).then(({
                    file,
                    content
                }) => {
                    return new Promise((resolve, reject) => {
                        let i = 0;

                        const popHook = () => {
                            if (i === this.patterns.length) {
                                return resolve({
                                    file,
                                    content
                                });
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
                                }).then(result=> {
                                    content = result.content;
                                    file = result.file;
                                    popHook();
                                }).catch(reject);
                            } else {
                                popHook();
                            }
                        };

                        popHook();

                    });
                }).then(({
                    file,
                    content
                }) => {
                    return W(`${OUTPUT}/${file}`, content);
                });
            });
            return Promise.all(fileTasks);
        });
    }
}

module.exports = new Sieve();