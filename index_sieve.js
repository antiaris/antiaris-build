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

const path = require('path');
const rimraf = require('rimraf');
const sieve = require('./lib/sieve');

const {
    info,
    help,
    debug,
    warn,
    error
} = require('antiaris-logger');
const {
    L,
    W,
    CWD,
    NAMESPACE,
    OUTPUT,
    SRC
} = require('./lib/config');

const {
    Transformer,
    SystemTransformer,
    BabelTransformer,
    StampTransformer,
    NoopTransformer,
    LessTransformer
} =require('./transformer/');

const resourceMap = {};

rimraf.sync(OUTPUT); // TODO:on demand



// TODO:Replace variables
//sieve.hook(`**/*.*`, ({
/*    file,
    content
}) => {
    return Promise.resolve({
        content
    });
});*/

// Binary files
//sieve.hook(`{${SRC},${NODE_MODULES}}/**/*.{${BINARY_RESOURCE}}`, ({
/*    file,
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
            writableFiles: [{
                file: `../static/${NAMESPACE}/${filename}`,
                content
            }],
            content
        });
    });
});*/

sieve.hook(`${SRC}/**/*.{js,jsx}`, new BabelTransformer().next(new NoopTransformer(), new SystemTransformer(resourceMap).next(new StampTransformer(resourceMap))));

sieve.hook(`${SRC}/**/*.less`, new LessTransformer().next(new StampTransformer(resourceMap)));

// Final Build
sieve.build(CWD).then(seeds => {
    return W(`${OUTPUT}/resource-map.json`, JSON.stringify(resourceMap, null, 4));
}).catch(e => {
    console.error(e);
    error(e.message);
});