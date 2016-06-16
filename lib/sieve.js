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
const minimatch = require('minimatch');

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
                    fs.readFile(file,'utf8',(err, content) => {});
                });
                /* const hookTasks = this.patterns.map(({
                     pattern,
                     fn
                 }) => {
                     return new Promise((resolve, reject) => {
                         // console.log(file,pattern);
                         if (minimatch(file, pattern)) {
                             fn(file).then(resolve, reject);
                         } else {
                             resolve();
                         }
                     });
                 });
                 return Promise.all(hookTasks);*/
            });
            return Promise.all(fileTasks);
        });
    }
}

module.exports = new Sieve();