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

const transformers = require('./transformer/');

const {
    W,
    OUTPUT,
    NAMESPACE
} = require('./config');
const minimatch = require('minimatch');
const {
    info,
    debug
} = require('antiaris-logger');

const {
    ReadTransformer
} = require('./transformer/');
const flattenDeep = require('lodash/flattenDeep');
const isNil = require('lodash/isNil');

const resourceMap = {};

const gStreams = [];

let streamNameIdx = 1;

class Stream {
    constructor(parent, pattern, transformer) {
        this.parent = parent;
        this.pattern = pattern;
        this.cacheFiles = {};
        this.transformer = transformer;

        this.isEnded = false;
        this.name = '';
    }
    pipe(transformer) {
        return new Stream(this, this.pattern, transformer);
    }
    update(file) {
        delete this.cacheFiles[file.filename];
        return this;
    }
    match(file) {
        return minimatch(file.filename, this.pattern);
    }
    flow(files) {
        info(`${this.name}...`);
        files = files.filter(file => {
            return this.match(file);
        });
        if (this.parent) {
            return this.parent.flow(files).then(files => {
                return this.flowIgnorePattern(files);
            });
        } else {
            return this.flowIgnorePattern(files);
        }
    }
    flowIgnorePattern(files) {
        const tasks = files.map(file => {
            if (this.cacheFiles[file.filename]) {
                return Promise.resolve(this.cacheFiles[file.filename]);
            } else {
                return this.transformer.transform(file, resourceMap).then(file => {
                    return (this.cacheFiles[file.filename] = file);
                });
            }
        });
        return Promise.all(tasks);
    }
    end(name) {
        if (this.isEnded) {
            throw new Error(`The stream cannot end more than once`);
        }
        this.name = name || `stream#${streamNameIdx++}`;
        gStreams.push(this);
        this.isEnded = true;
    }
}

class Sieve {
    src(pattern) {
        let {
            files
        } = this;
        files = files.filter(({
            filename
        }) => minimatch(filename, pattern));
        const stream = new Stream(null, pattern, new ReadTransformer());
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
                    // Convert file path to {filename,content,moduleId}
                    resolve(files.map(filename => ({
                        filename,
                        content: undefined,
                        moduleId: `${NAMESPACE}:${filename}`
                    })));
                }
            });
        });
    }
    build() {
        return new Promise((resolve, reject) => {
            let i = 0;
            const ret = [];
            const walkStream = () => {
                if (i === gStreams.length) {
                    resolve(ret);
                } else {
                    const stream = gStreams[i];
                    stream.flow(this.files).then(data => {
                        ret.push(data);
                        walkStream();
                    }).catch(reject);
                }
                i += 1;
            };
            walkStream();
        }).then(data => {
            const files = flattenDeep(data);

            return Promise.all(files.map(({
                filename,
                content
            }) => {
                if (!filename) {
                    debug(`Cancel write file due to no filename`);
                    return filename;
                }
                if (isNil(content)) {
                    return content;
                }
                return W(`${OUTPUT}/app/${filename}`, content);
            })).then(() => {
                return W(`${OUTPUT}/resource-map.json`, JSON.stringify(resourceMap, null, 4));
            });
        });
    }
    ready(cwd) {
        return this._getFiles(cwd).then(files => {
            this.files = files;
        });
    }
}

const gSieve = new Sieve();

Object.keys(transformers).forEach(transformerName => {
    const name = transformerName.replace(/Transformer$/i, '');
    gSieve[name.toLowerCase()] = options => {
        return Function('transformers', 'options', `return new transformers.${transformerName}(options)`)(transformers, options);
    };
});

module.exports = gSieve;