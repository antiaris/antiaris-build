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
const chokidar = require('chokidar');

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
        if (!this.pattern) {
            return false;
        }
        return minimatch(file.filename, this.pattern);
    }
    flow(files, force) {
        info(`${this.name}...`);
        if (this.parent) {
            return this.parent.flow(files, force).then(files => {
                return this.flowIgnorePattern(files, force);
            });
        } else {
            return this.flowIgnorePattern(files, force);
        }
    }
    flowIgnorePattern(files, force) {
        const tasks = files.map(file => {
            if (!force && this.cacheFiles[file.filename]) {
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

const leftStream = new Stream(null, null, new ReadTransformer());

class Sieve {
    pick(pattern) {
        return new Stream(null, pattern, new ReadTransformer());
    }
    left() {
        return leftStream;
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
    build(...newFiles) {
        const allFiles = this.files;

        newFiles.forEach(file => {
            switch (file.cmd) {
            case 'add':
                allFiles.push({
                    filename: file.filename,
                    content: undefined,
                    moduleId: `${NAMESPACE}:${filename}`
                });
                break;
            case 'change':
                for (let i = 0; i < allFiles.length; ++i) {
                    if (file.filename === allFiles[i].filename) {
                        allFiles[i].content = undefined;
                        break;
                    }
                }
                break;
            case 'remove':
                for (let i = 0; i < allFiles.length; ++i) {
                    if (file.filename === allFiles[i].filename) {
                        allFiles.splice(i, 1);
                        break;
                    }
                }
                break;
            }
        });

        return new Promise((resolve, reject) => {
            const ret = [];

            let leftFiles = allFiles.slice();
            const group = new Array(gStreams.length + 1); // One for left

            for (let k = 0; k < group.length; ++k) {
                group[k] = [];
            }

            let leftStreamIdx = -1;

            for (let x = 0; x < allFiles.length; ++x) {
                const file = allFiles[x];
                for (let y = 0; y < gStreams.length; ++y) {
                    // Find the left stream
                    if (gStreams[y].pattern === null) {
                        leftStreamIdx = y;
                        continue;
                    }
                    if (gStreams[y].match(file)) {
                        group[y].push(file);
                        leftFiles[x] = null;
                    }
                }
            }

            leftFiles = leftFiles.filter(f => !!f);
            if (leftStreamIdx >= 0) {
                group[leftStreamIdx] = leftFiles;
            }

            let startStreamIdx = 0;
            for (let n = 0; n < gStreams.length; ++n) {
                let found = false;
                for (let m = 0; m < newFiles.length; ++m) {
                    if (gStreams[n].match(newFiles[m])) {
                        startStreamIdx = n;
                        found = true;
                        break;
                    }
                }
                if (found) {
                    break;
                }
            }

            debug(`Walk stream from ${startStreamIdx}`);
            const startTime = process.hrtime();
            const walkStream = () => {
                if (startStreamIdx === gStreams.length) {
                    const diff = process.hrtime(startTime);
                    const millseconds = parseInt(diff[0] * 1e3 + diff[1] / 1e6, 10);
                    info(`Complete in ${millseconds}ms`);
                    resolve(ret);
                } else {
                    const stream = gStreams[startStreamIdx];
                    stream.flow(group[startStreamIdx], true).then(data => {
                        ret.push(data);
                        walkStream();
                    }).catch(reject);
                }
                startStreamIdx += 1;
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
    watch(cwd) {
        info(`Watching ${cwd}...`)
        const watcher = chokidar.watch(`${cwd}/**/*`, {
            ignored: [`${OUTPUT}/**/*`, /[\/\\]\./],
            persistent: true,
            awaitWriteFinish: true,
            ignoreInitial: true,
            cwd
        });
        watcher.on('add', path => {
                debug(`File ${path} has been added`);
                this.build({
                    filename: path,
                    cmd: 'add'
                });
            })
            .on('change', path => {
                debug(`File ${path} has been changed`);
                this.build({
                    filename: path,
                    cmd: 'change'
                });
            })
            .on('unlink', path => {
                debug(`File ${path} has been removed`);
                this.build({
                    filename: path,
                    cmd: 'remove'
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
        return Function('transformers', 'options',
            `return new transformers.${transformerName}(options)`)(
            transformers, options);
    };
});

module.exports = gSieve;