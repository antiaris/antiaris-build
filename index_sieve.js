/**
 * Copyright (C) 2016 yanni4night.com
 * index_sieve.js
 *
 * changelog
 * 2016-06-16[19:10:36]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const sieve = require('./lib/sieve');
const {
    filestamp
} = require('antiaris-filestamp');
const {
    info,
    debug,
    warn,
    error
} = require('antiaris-logger');
const {
    L,
    R,
    W,
    MV,
    CP,
    CWD,
    NODE_MODULES,
    NAMESPACE,
    OUTPUT,
    SRC,
    BINARY_RESOURCE
} = require('./lib/config');

const resourceMap = {};

rimraf.sync(OUTPUT); // TODO:on demand

sieve.hook(`{${SRC},${NODE_MODULES}}/**/*.{${BINARY_RESOURCE}}`, ({
    file,
    content
}) => {
    return new Promise((resolve, reject) => {

        let {
            filename
        } = filestamp.sync(L(file));
        
        let moduleId = `${NAMESPACE}:${file}`;
        
        resourceMap[moduleId] = {
            uri: `${NAMESPACE}/${filename}`,
            deps: []
        };

        resolve({
            file: `static/${filename}`,
            content
        });
    });
});

sieve.build(CWD).catch(e => {
    error(e.message);
});