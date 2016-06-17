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
const sieve = require('./sieve');

const {
    error
} = require('antiaris-logger');
const {
    W,
    CWD,
    OUTPUT,
    SRC,
    NODE_MODULES,
    BINARY_RESOURCE
} = require('./config');

const {
    SystemTransformer,
    BabelTransformer,
    StampTransformer,
    NoopTransformer,
    LessTransformer
} = require('./transformer/');

const resourceMap = {};

rimraf.sync(OUTPUT); // TODO:on demand

// Binary files
sieve.hook(`{${SRC},${NODE_MODULES}}/**/*.{${BINARY_RESOURCE}}`, new StampTransformer(resourceMap));

sieve.hook(`${SRC}/**/*.{js,jsx}`, new BabelTransformer().next(new NoopTransformer(), new SystemTransformer(resourceMap)
    .next(new StampTransformer(resourceMap))));

sieve.hook(`${SRC}/**/*.less`, new LessTransformer().next(new StampTransformer(resourceMap)));

// Final Build
sieve.build(CWD).then(() => {
    return W(`${OUTPUT}/resource-map.json`, JSON.stringify(resourceMap, null, 4));
}).catch(e => {
    console.log(e)
    error(e.message);
});