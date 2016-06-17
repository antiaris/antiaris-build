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
    BINARY_RESOURCE,
    IGNORE
} = require('./config');

const {
    SystemTransformer,
    BabelTransformer,
    StampTransformer,
    NoopTransformer,
    LessTransformer,
    UglifyTransformer,
    IntegrityTransformer,
    IgnoreTransformer
} = require('./transformer/');

const resourceMap = {};

rimraf.sync(OUTPUT); // TODO:on demand

sieve.hook(`**/{${IGNORE}}`, new IgnoreTransformer());
// Binary
sieve.hook(`${SRC}/**/*.{${BINARY_RESOURCE}}`, new StampTransformer(resourceMap, true));
// Less/CSS
sieve.hook(`${SRC}/**/*.{css,less}`, new LessTransformer(true).next(new IntegrityTransformer(resourceMap).next(new StampTransformer(resourceMap, true))));
// SRC
sieve.hook(`${SRC}/**/*.{js,jsx}`, new BabelTransformer(true).next(new NoopTransformer(), new SystemTransformer(resourceMap, true).next(new UglifyTransformer(true).next(new IntegrityTransformer(resourceMap).next(new StampTransformer(resourceMap, true))))));
// NODE_MODUES
sieve.hook(`${NODE_MODULES}/**/*.{js,jsx}`, new NoopTransformer().next(new NoopTransformer(), new SystemTransformer(resourceMap).next(new UglifyTransformer().next(new IntegrityTransformer(resourceMap).next(new StampTransformer(resourceMap))))));

// Final Build
sieve.build(CWD).then(() => {
    return W(`${OUTPUT}/resource-map.json`, JSON.stringify(resourceMap, null, 4));
}).catch(e => {
    /*eslint no-console: ["error", { allow: ["log", "error"] }]*/
    console.log(e);
    error(e.message);
});