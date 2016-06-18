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

const {
    isBinary,
    W,
    R,
    OUTPUT
} = require('./config');
const minimatch = require('minimatch');
const {
    debug
} = require('antiaris-logger');

const Transformer = require('./transformer/transformer');
const flattenDeep = require('lodash/flattenDeep')
const extend = require('lodash/extend');

const gStreams = [];

class Stream {
    constructor(parent, pattern, files, transformer) {
        this.parent = parent;
        this.pattern = pattern;
        this.files = files;
        this.transformer = transformer;

    }
    pipe(transformer) {
        return new Stream(this, this.pattern, this.files, transformer);
    }
    flow() {
        if (this.parent) {
            return this.parent.flow().then(files => {
                return this.bulkTransform(files);
            });
        } else {
            return this.bulkTransform(this.files)
        }
    }
    bulkTransform(files) {
        return Promise.all(files.map(file /*File Object*/ => {
            return this.transformer.transform(file);
        })).then(flattenDeep);
    }
    end() {
        gStreams.push(this);
    }
}

class ReadTransformer extends Transformer {
    _transform(seed) {
        const {
            file,
            content
        } = seed;
        if (content !== null && content !== undefined) {
            return Promise.resolve(extend({}, seed));
        } else {
            return R(file, isBinary(file)).then(content => {
                return extend({}, seed, {
                    content
                });
            });
        }
    }
}

class Sieve {
    constructor() {

    }
    src(pattern) {
        let {
            files
        } = this;
        files = files.filter(({
            file
        }) => minimatch(file, pattern));
        const stream = new Stream(null, pattern, files, new ReadTransformer());
        return stream;
    }
    _getFiles(cwd) {
        return new Promise((resolve, reject) => {
            glob('**/*.*', {
                cwd
            }, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    // Convert file path to file object
                    resolve(files.map(file => ({
                        file
                    })));
                }
            });
        })
    }
    build() {
        return new Promise((resolve, reject) => {
            let i = 0;
            const s = [];
            const run = () => {
                if (i === gStreams.length) {
                    resolve(s);
                } else {
                    const stream = gStreams[i];
                    i += 1;
                    stream.flow().then(data => {
                        s.push(data)
                        run();
                    }, reject);
                }
            }
            run();
        }).then(data => {
            const files = flattenDeep(data);

            return Promise.all(files.map(({
                file,
                content
            }) => {
                if (!file) {
                    debug(`Cancel write file due to no file`);
                    return file;
                }
                if (null == content) {
                    debug(
                        `Cancel write file(${file}) due to no content`
                    );
                    return content;
                }
                return W(`${OUTPUT}/app/${file}`, content);
            }));
        });
    }
    ready(cwd, cb) {
        this._getFiles(cwd).then(files => {
            this.files = files;
            cb();
        }).catch(cb);
    }
}

module.exports = new Sieve();