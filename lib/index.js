/**
 * Copyright (C) 2016 yanni4night.com
 * index.js
 *
 * changelog
 * 2016-06-16[19:10:36]:revised
 * 2016-06-19[02:03:45]:screaming
 *
 * @author yanni4night@gmail.com
 * @version 2.0.0
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

rimraf.sync(OUTPUT);

sieve.ready(CWD, (err) => {

    if (err) {
        return console.error(err);
    }

    sieve.src('**/*.*').end();

    sieve.src(`**/*.{${BINARY_RESOURCE}}`).pipe(new StampTransformer(resourceMap, true)).end();

    sieve.src(`${SRC}/**/*.{css,less}`).pipe(new LessTransformer(true)).pipe(new IntegrityTransformer(resourceMap)).pipe(new StampTransformer(resourceMap, true)).end();

    const tpl = sieve.src(`**/*.{html,htm,shtml,xhtml,tpl}`);
    tpl.pipe(new StampTransformer(resourceMap, true)).end();

    const src = sieve.src(`${SRC}/**/*.{js,jsx}`).pipe(new BabelTransformer(true));
    src.pipe(new NoopTransformer()).end();
    src.pipe(new SystemTransformer(resourceMap, true)).pipe(new UglifyTransformer(true)).pipe(new IntegrityTransformer(resourceMap)).pipe(new StampTransformer(resourceMap, true)).end();

    tpl.end();
    const nodeModules = sieve.src(`${NODE_MODULES}/**/*.{js,jsx}`);
    nodeModules.end();
    nodeModules.pipe(new SystemTransformer(resourceMap)).pipe(new UglifyTransformer()).pipe(new IntegrityTransformer(resourceMap)).pipe(new StampTransformer(resourceMap)).end();

    sieve.build().then(() => {
        return W(`${OUTPUT}/resource-map.json`, JSON.stringify(resourceMap, null, 4));
    }).catch(e => {
        /*eslint no-console: ["error", { allow: ["log", "error"] }]*/
        console.log(e);
    });
})