/**
 * Copyright (C) 2016 yanni4night.com
 * config.js
 *
 * changelog
 * 2016-06-16[19:28:48]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const path = require('path');
const fs = require('fs');
const cp = require('cp');
const mv = require('mv');
const yaml = require('js-yaml');
const minimatch = require('minimatch');
const mkdirp = require('mkdirp');
const extend = require('lodash/extend');

const CWD = process.argv[2] || process.cwd();

const NODE_MODULES = 'node_modules';

function L(name) {
    return path.join(CWD, name);
}

function R(name) {
    return fs.readFileSync(L(name), 'utf-8');
}

function W(name, content) {
    const fpath = L(name);
    const dir = path.dirname(fpath);
    if (!fs.existsSync(dir)) {
        mkdirp.sync(dir);
    }
    return fs.writeFileSync(fpath, content);
}

function MV(src, dest, cb) {
    mv(L(src), L(dest), {
        mkdirp: true
    }, cb);
}

function CP(src, dest, cb) {
    const fpath = L(dest);
    const dir = path.dirname(fpath);
    if (!fs.existsSync(dir)) {
        mkdirp.sync(dir);
    }
    cp(L(src), fpath, cb);
}

// 项目配置文件
const CONFIG = extend({
    NAMESPACE: null,
    OUTPUT: 'output',
    SRC: 'src',
    BINARY_RESOURCE: 'webp,png,jpg,jpeg,gif,bmp,swf,woff,woff2,ttf,eot,otf,cur'
}, yaml.safeLoad(R('antiaris.yml')));

module.exports = extend({}, CONFIG, {
    L,
    R,
    W,
    MV,
    CP,
    CWD,
    NODE_MODULES,
    isBinary: file => minimatch(path.basename(file), `*.{${CONFIG.BINARY_RESOURCE}}`)
});
Object.freeze(module.exports);