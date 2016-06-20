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
    constructor(parent, pattern, transformer, resourceMap) {
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
            },
            resourceMap: {
                value: resourceMap,
                writable: false,
                configurable: false,
                enumerable: true
            }
        });

        this.name = '';
    }
    pipe(transformer) {
        const child = new Stream(this, this.pattern, transformer, this.resourceMap);
        child.on('end', leaf => {
            // bubble up
            this.emit('end', leaf);
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
    flow(files) {
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
            if (this.cacheFiles.has(file.filename)) {
                return Promise.resolve(this.cacheFiles.get(file.filename));
            } else {
                return this.transformer.transform(file.clone(), this.resourceMap).then(file => {
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