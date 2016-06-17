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
                    R(file, isBinary(file)).then(resolve, reject);
                }).then(content => {
                    return new Promise((resolve, reject) => {
                        let i = 0;

                        const popHook = () => {
                            if (i === this.patterns.length || !content) {
                                return resolve(content);
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
                                    popHook();
                                }).catch(reject);
                            } else {
                                popHook();
                            }
                        };

                        popHook();

                    });
                }).then(content => {
                    // Ignore empty files
                    if (!content) {
                        return content;
                    }
                    return W(`${OUTPUT}/app/${file}`, content);
                });
            });
            return Promise.all(fileTasks);
        });
    }
}

module.exports = new Sieve();