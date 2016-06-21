/**
 * Copyright (C) 2016 yanni4night.com
 * resource-map.js
 *
 * changelog
 * 2016-06-20[15:04:50]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const extend = require('lodash/extend');
const isUndefined = require('lodash/isUndefined');
/**
 * {
 *     moduleId: {
 *         uri:
 *         deps: []
 *     }
 * }
 * 
 * @class
 */
class ResourceMap {
    constructor() {
        // Lock this.map
        Object.defineProperties(this, {
            map: {
                value: {},
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    set(moduleId, options) {
        if (!options) {
            return;
        }
        if (!this.map[moduleId]) {
            this.map[moduleId] = {};
        }
        extend(this.map[moduleId], options);
    }
    remove(moduleId, key) {
        if (isUndefined(key)) {
            delete this.map[moduleId];
        } else if (this.map[moduleId]) {
            delete this.map[moduleId][key];
        }
    }
}

module.exports = ResourceMap;