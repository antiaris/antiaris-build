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
const babel = require('babel-core');
const less = require('less');
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

const {
    Transformer,
    SystemTransformer,
    BabelTransformer,
    StampTransformer,
    NoopTransformer
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

// Less files
//sieve.hook(`{${SRC},${NODE_MODULES}}/**/*.less`, ({
/*    file,
    content
}) => {
    return new Promise((resolve, reject) => {
        less.render(content, {
            filename: file,
            compress: true
        }, (err, output) => {
            if (err) {
                reject(err);
            } else {
                resolve(output.css);
            }
        });
    }).then(css => {
        let {
            filename
        } = filestamp.sync(L(file));

        filename = filename.replace(/\.less$/i, '.css');

        let moduleId = `${NAMESPACE}:${file}`;

        resourceMap[moduleId] = {
            uri: `${NAMESPACE}/${filename}`,
            deps: []
        };

        return ({
            writableFiles: [{
                file: `../static/${NAMESPACE}/${filename}`,
                content: css
            }]
        });
    });
});*/



sieve.hook(`${SRC}/**/*.{js,jsx}`, new BabelTransformer().next(new NoopTransformer(), new SystemTransformer().next(new StampTransformer(resourceMap))));


// ES6->ES5
//sieve.hook(`${NODE_MODULES}/**/*.{js,jsx}`, babelTransform);
// CommonJS to SystemJS
//sieve.hook(`${NODE_MODULES}/**/*.js`, ;

// Stamp
//sieve.hook(`${NODE_MODULES}/**/*.js`, ({
/*    file,
    content
}) => {
    const moduleId = `${NAMESPACE}:${file}`;
    return new Promise((resolve, reject) => {
        let {
            filename
        } = filestamp.sync(L(file));

        resourceMap[moduleId] = resourceMap[moduleId] || {};

        resourceMap[moduleId].uri = `${NAMESPACE}/${filename}`;
        return resolve({
            writableFiles: [{
                file: `../static/${NAMESPACE}/${filename}`,
                content
            }],
            content
        });
    });
});*/

// Final Build
sieve.build(CWD).then(seeds => {
    //console.log(seeds);
    return W(`${OUTPUT}/resource-map.json`, JSON.stringify(resourceMap, null, 4));
}).catch(e => {
    console.error(e);
    error(e.message);
});