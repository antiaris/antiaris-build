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
const less = require('less');
const mkdirp = require('mkdirp');
const nodeResolve = require('antiaris-node-resolve');
const c2s = require('antiaris-transform-commonjs-modules-systemjs');
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


// TODO:Replace variables
sieve.hook(`**/*.*`, ({
    file,
    content
}) => {
    return Promise.resolve({
        file,
        content
    });
});

// Binary files
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
            file: `../static/${NAMESPACE}/${filename}`,
            content
        });
    });
});

// Less files
sieve.hook(`{${SRC},${NODE_MODULES}}/**/*.less`, ({
    file,
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
            file: `../static/${NAMESPACE}/${filename}`,
            content: css
        });
    });
});

// "node_modules" Script files
// 这里的文件需要生成两份代码，同构之用
// (1)[Server]原文不动复制过去
// (2)[Client]生成SystemJS风格，计算时间戳
sieve.hook(`${NODE_MODULES}/**/*.js`, ({
    file,
    content
}) => {
    return new Promise((resolve, reject) => {
        const moduleId = `${NAMESPACE}:${file}`;

        c2s.transformFile(L(file), {
            moduleId,
            translateDep: dep => {
                let p = nodeResolve.resolve(L(file), dep);
                if (!p) {
                    warn(`Dependency "${dep}" not found for ${file}`);
                    return p;
                }
                return `${NAMESPACE}:` + path.relative(CWD, p);
            }
        }, (err, result) => {
            if (err) {
                error(`Transform "${file}" error: ${err.message}`);
                let {
                    filename
                } = filestamp.sync(L(file));

                resourceMap[moduleId] = {
                    uri: `${NAMESPACE}/${filename}`,
                    deps: []
                };
                return resolve({
                     file: `../static/${NAMESPACE}/${filename}`,
                     content
                });
            } else {
                let {
                    filename
                } = filestamp.sync(L(file));

                resourceMap[moduleId] = {
                    uri: `${NAMESPACE}/${filename}`,
                    deps: result.deps
                };
                return resolve({
                    file: `../static/${NAMESPACE}/${filename}`,
                    content: result.code
                });
            }
        });
    });
});

// "src" Script files
// 这里的文件需要生成两份代码，同构之用
// (1)[Server]Babel转换成ES5/CommonJS
// (2)[Client]Babel转换成ES5/CommonJS，生成SystemJS风格，计算时间戳
sieve.hook(`${SRC}/**/*.{js,jsx}`, ({
    file,
    content
}) => {
    return Promise.resolve({
        file,
        content
    });
});

// Final Build
sieve.build(CWD).then(() => {
    return W(`${OUTPUT}/resource-map.json`, JSON.stringify(resourceMap, null, 4));
}).catch(e => {console.log(e)
    error(e.message);
});