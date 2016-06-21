/**
 * Copyright (C) 2016 yanni4night.com
 * file.js
 *
 * changelog
 * 2016-06-20[14:38:37]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const {
    NAMESPACE
} = require('./config');

class File {
    constructor(filename, content, destname, resource) {
        Object.defineProperties(this, {
            filename: {
                value: filename,
                writable: false,
                configurable: false,
                enumerable: true
            },
            destname: {
                value: destname || filename,
                writable: true,
                configurable: false,
                enumerable: true
            },
            content: {
                value: content,
                writable: true,
                configurable: false,
                enumerable: true
            },
            moduleId: {
                get() {
                    return `${NAMESPACE}:${filename}`;
                },
                configurable: false,
                enumerable: true
            },
            resource: {
                value: resource,
                writable: true,
                configurable: false,
                enumerable: true
            }
        });
    }
    clone() {
        return new File(this.filename, this.content, this.destname, this.resource);
    }
    update(content) {
        this.content = content;
        return this;
    }
    truncate() {
        this.content = null;
        return this;
    }
    setResource(key, value) {
        // Prevent from useless memory allocate
        if (!this.resource) {
            this.resource = {};
        }
        this.resource[key] = value;
        return this;
    }
}

module.exports = File;