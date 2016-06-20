/**
 * Copyright (C) 2016 yanni4night.com
 * stream.js
 *
 * changelog
 * 2016-06-20[14:47:49]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const minimatch = require('minimatch');
const FileCollection = require('./file-collection');
const EventEmitter = require('events');

class Stream extends EventEmitter {
    constructor(parent, pattern, transformer) {
        super();
        Object.defineProperties(this, {
            parent: {
                value: parent,
                writable: false,
                configurable: false,
                enumerable: true
            },
            pattern: {
                value: pattern,
                writable: false,
                configurable: false,
                enumerable: true
            },
            transformer: {
                value: transformer,
                writable: false,
                configurable: false,
                enumerable: true
            },
            cacheFiles: {
                value: new FileCollection(),
                writable: false,
                configurable: false,
                enumerable: true
            }/*,
            resourceMap: {
                value: resourceMap,
                writable: false,
                configurable: false,
                enumerable: true
            }*/
        });

        transformer.on('resmap', (...args) => {
            this.emit('resmap', ...args);
        });

        this.name = '';
    }
    pipe(transformer) {
        const child = new Stream(this, this.pattern, transformer);
        child.on('end', leaf => {
            // bubble up
            this.emit('end', leaf);
        });
        child.on('resmap', (...args) => {
            this.emit('resmap', ...args);
        });
        return child;
    }
    update(file) {
        this.cacheFiles.remove(file.filename);
        return this;
    }
    match(filename) {
        if (!this.pattern) {
            return false;
        }
        return minimatch(filename, this.pattern);
    }
    flow(files, diffs = []) {
        if (this.parent) {
            return this.parent.flow(files, diffs).then(files => {
                return this.flowIgnorePattern(files, diffs);
            });
        } else {
            return this.flowIgnorePattern(files, diffs);
        }
    }
    flowIgnorePattern(files, diffs = []) {
        const tasks = files.map(file => {
            if (!diffs.some(diff => (diff.filename === file.filename)) && this.cacheFiles.has(file.filename)) {
                return Promise.resolve(this.cacheFiles.get(file.filename));
            } else {
                return this.transformer.transform(file.clone()).then(file => {
                    this.cacheFiles.add(file, true);
                    return file;
                });
            }
        });
        return Promise.all(tasks);
    }
    end(name) {
        this.name = name;
        this.emit('end', this);
    }
}

module.exports = Stream;