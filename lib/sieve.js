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
    hook(pattern, transformer) {
        this.patterns.push({
            pattern,
            transformer
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
                        let seeds = [{
                            file,
                            content
                        }];

                        const popHook = () => {
                            if (i === this.patterns.length || !content || !file) {
                                return resolve(seeds);
                            }
                            const {
                                pattern,
                                transformer
                            } = this.patterns[i];

                            i += 1;
                            if (minimatch(file, pattern)) {
                                Promise.all(seeds.map(seed => {
                                    return transformer.transform(
                                        seed);
                                })).then(result => {
                                    seeds = Array.isArray(result) ?
                                        result : [result];
                                    popHook();
                                }).catch(reject);
                            } else {
                                popHook();
                            }
                        };

                        popHook();

                    });
                }).then(seeds => {
                    // Ignore empty files
                    return Promise.all(seeds.map(({
                        content,
                        file
                    }) => {
                        if (!content) {
                            return content;
                        }
                        if (!file) {
                            return file;
                        }
                        return W(`${OUTPUT}/app/${file}`, content);
                    }));
                });
            });
            return Promise.all(fileTasks);
        });
    }
}

module.exports = new Sieve();