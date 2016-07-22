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

const isUndefined = require('lodash/isUndefined');
const defineFrozenProperty = require('define-frozen-property');

class ResourceMap {
    constructor() {
        defineFrozenProperty(this, '_map', new Map());
    }
    set(moduleId, options) {
        if (!options) {
            return;
        }

        if (!this._map.has(moduleId)) {
            this._map.set(moduleId, new Map());
        }
        for (let dfn in options) {
            this._map.get(moduleId).set(dfn, options[dfn]);
        }
    }
    get(moduleId) {
        return this._map.get(moduleId);
    }
    remove(moduleId, key) {
        if (isUndefined(key)) {
            this._map.delete(moduleId);
        } else if (this._map.has(moduleId)) {
            this._map.get(moduleId).delete(key);
        }
    }
    clear() {
        this._map.clear();
    }
    toJSONString() {
        const ret = {};
        for (let [mid, opts] of this._map) {
            ret[mid] = ret[mid] || {};
            for (let [oname, opty] of opts) {
                ret[mid][oname] = opty;
            }
        }
        return JSON.stringify(ret, null, 4);
    }
}

module.exports = ResourceMap;