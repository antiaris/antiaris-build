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
    constructor(filename, content, destname) {
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
                value: `${NAMESPACE}:${filename}`,
                writable: false,
                configurable: false,
                enumerable: true
            }
        });
    }
    clone(content) {
        return new File(this.filename, content || this.content, this.destname);
    }
    update(content) {
        this.content = content;
        return this;
    }
    truncate() {
        this.content = null;
        return this;
    }
}

module.exports = File;