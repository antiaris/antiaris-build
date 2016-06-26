/**
 * Copyright (C) 2016 antiaris.xyz
 * resource-map.js
 *
 * changelog
 * 2016-06-26[02:30:10]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const {
    isUndefined,
    extend
} = require('lodash');

class ResourceMap {
    constructor() {
        // Lock this.map
        Object.defineProperties(this, {
            _map: {
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
        if (!this._map[moduleId]) {
            this._map[moduleId] = {};
        }
        extend(this._map[moduleId], options);
    }
    get(moduleId) {
        return this._map[moduleId];
    }
    remove(moduleId, key) {
        if (isUndefined(key)) {
            delete this._map[moduleId];
        } else if (this._map[moduleId]) {
            delete this._map[moduleId][key];
        }
    }
}

module.exports = ResourceMap;