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
    CWD,
    OUTPUT
} = require('./config');
const {
    info,
    debug
} = require('antiaris-logger');

const {
    ReadTransformer
} = require('./transformer/');
const flattenDeep = require('lodash/flattenDeep');
const ResourceMap = require('./resource-map');
const Stream = require('./stream');
const File = require('./file');
const FileCollection = require('./file-collection');



class Sieve {
    constructor() {
        Object.defineProperties(this, {
            resourceMap: {
                value: new ResourceMap(),
                writable: false,
                configurable: false,
                enumerable: true
            },
            fileCollectionGroup: {
                value: [],
                writable: false,
                configurable: false,
                enumerable: true
            },
            streams: {
                value: [],
                writable: false,
                configurable: false,
                enumerable: true
            }
        });
    }
    pick(pattern) {
        const stream = new Stream(null, pattern, new ReadTransformer(), this.resourceMap);
        stream.on('end', leaf => {
            this.streams.push(leaf);
        });
        return stream;
    }
    left() {
        const leftStream = new Stream(null, null, new ReadTransformer());
        leftStream.on('end', leaf => {
            this.streams.push(leaf);
        });
        return leftStream;
    }
    _getFiles(cwd) {
        return new Promise((resolve, reject) => {
            glob('**/*.*', {
                cwd
            }, (err, filenames) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(filenames);
                }
            });
        });
    }
    watch() {
        info(`Watching ${CWD}...`);
        const watcher = chokidar.watch(`${CWD}/**/*`, {
            ignored: [`${OUTPUT}/**/*`, /[\/\\]\./],
            persistent: true,
            // awaitWriteFinish: true,
            ignoreInitial: true,
            cwd: CWD
        });
        watcher.on('add', path => {
                debug(`File ${path} has been added`);
                this._onWatchFiles({
                    filename: path,
                    cmd: 'add'
                });
            })
            .on('change', path => {
                debug(`File ${path} has been changed`);
                this._onWatchFiles({
                    filename: path,
                    cmd: 'change'
                });
            })
            .on('unlink', path => {
                debug(`File ${path} has been removed`);
                this._onWatchFiles({
                    filename: path,
                    cmd: 'remove'
                });
            });

    }
    _walkStream(startStreamIdx = 0, diffs) {
        return new Promise((resolve, reject) => {
            let ret = [];
            debug(`Walk stream from ${startStreamIdx}`);
            const startTime = process.hrtime();
            const walkStream = () => {
                if (startStreamIdx === this.streams.length) {
                    const diff = process.hrtime(startTime);
                    const millseconds = parseInt(diff[0] * 1e3 + diff[1] / 1e6, 10);
                    info(`Complete in ${millseconds}ms`);
                    resolve(ret);
                } else {
                    const stream = this.streams[startStreamIdx];
                    stream.flow(this.fileCollectionGroup[startStreamIdx].values(), diffs).then(data => {
                        ret.push(data);
                        walkStream();
                    }).catch(reject);
                }
                startStreamIdx += 1;
            };
            walkStream();
        });
    }
    _onWatchFiles(...diffs) {
        let startStreamIdx = this.streams.length;
        for (let i = 0; i < diffs.length; ++i) {
            for (let j = 0; j < this.streams.length; ++j) {
                if (this.streams[j].match(diffs[i].filename)) {
                    startStreamIdx = Math.min(startStreamIdx, j);
                    switch (diffs[i].cmd) {
                    case 'add':
                        this.fileCollectionGroup[j].add(new File(diffs[i].filename));
                        break;
                    case 'change':
                        this.fileCollectionGroup[j].refresh(diffs[i].filename);
                        break;
                    case 'remove':
                        this.fileCollectionGroup[j].remove(diffs[i].filename);
                        break;
                    }
                }
            }
        }
        return this._walkStream(startStreamIdx, diffs).then(this._write.bind(this));
    }
    _group(filenames) {
        const group = this.fileCollectionGroup;

        // Initialize group
        for (let k = 0; k < this.streams.length; ++k) {
            group[k] = new FileCollection();
        }

        const leftGroup = new FileCollection();
        let leftStreamIdx = -1;

        for (let i = 0; i < filenames.length; ++i) {
            let filename = filenames[i];
            let matched = false;

            this.streams.forEach((stream, idx) => {
                if (!stream.pattern) {
                    leftStreamIdx = idx;
                } else if (stream.match(filename)) {
                    matched = true;
                    group[idx].add(new File(filename));
                }
            });

            if (!matched) {
                leftGroup.add(new File(filename));
            }
        }

        if (leftStreamIdx >= 0) {
            group[leftStreamIdx] = leftGroup;
        }

    }
    build(init) {
        init(this);
        return this._getFiles(CWD).then(filenames => {
            return this._group(filenames);
        }).then(() => {
            return this._walkStream();
        }).then(this._write.bind(this));
    }
    _write(data) {
        const files = flattenDeep(data);

        return Promise.all(files.map(({
            destname,
            content
        }) => {
            if (!destname || !content) {
                return;
            }
            return W(`${OUTPUT}/app/${destname}`, content);
        })).then(() => {
            return W(`${OUTPUT}/resource-map.json`, JSON.stringify(this.resourceMap.map, null, 4));
        });
    }
}

const sieve = new Sieve();

Object.keys(transformers).forEach(transformerName => {
    const name = transformerName.replace(/Transformer$/i, '');
    sieve[name.toLowerCase()] = options => {
        return Function('transformers', 'options',
            `return new transformers.${transformerName}(options)`)(
            transformers, options);
    };
});

module.exports = sieve;