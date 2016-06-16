/**
 * Copyright (C) 2016 yanni4night.com
 * index.
 *
 * changelog
 * 2016-06-15[18:10:18]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const npm = require('../npm/');
const path = require('path');
const rimraf = require('rimraf');
const fs = require('fs');
const mkdirp = require('mkdirp');
const glob = require('glob');
const babel = require('babel-core');
const isString = require('lodash/isString');
const extend = require('lodash/extend');
const {
    info,
    debug,
    warn,
    error
} = require('antiaris-logger');
const {
    filestamp
} = require('antiaris-filestamp');

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

// 编译后输出目录

const TMP_SRC = NAMESPACE;

info(`Process [${NAMESPACE}] in ${CWD}`);

rimraf.sync(OUTPUT);
rimraf.sync(TMP_SRC);

Promise.resolve(0).then(() => {
    return new Promise((resolve, reject) => {
        info('Compiling static binary resource...');
        glob(`{${SRC},${NODE_MODULES}}/**/*.{${BINARY_RESOURCE}}`, {
            cwd: CWD
        }, (err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    });
}).then(files => {
    const binaryMap = {};
    const tasks = files.map(file => {
        return new Promise((resolve, reject) => {
            let {
                filename
            } = filestamp.sync(L(file));
            let moduleId = `${NAMESPACE}:${file}`;
            binaryMap[moduleId] = {
                uri: `${NAMESPACE}/${filename}`,
                deps: []
            };

            mkdirp.sync(`${OUTPUT}/static/`);

            CP(file, `${OUTPUT}/static/${filename}`, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });

    return Promise.all(tasks).then(() => {
        W(`${OUTPUT}/binary-map.json`, JSON.stringify(binaryMap, null, 4));
    });

}).then(() => {
    return new Promise((resolve, reject) => {
        info('Compiling src...');
        // Compile src
        glob('**/*.{js,jsx}', {
            cwd: L(SRC)
        }, (err, files) => {
            if (err) {
                return reject(err);
            }
            files.forEach(file => {
                const result = babel.transformFileSync(path.join(L(SRC), file), {
                    extends: path.join(__dirname, '.babelrc')
                });

                W(`${TMP_SRC}/${file}`, result.code);
            });
            resolve();
        });
    })
}).then(() => {
    info('Compiling node_modules...');
    // Compile node_modules
    return new Promise((resolve, reject) => {
        npm(CWD, {
            pattern: `{${TMP_SRC},${NODE_MODULES}}/**/*.{js,jsx,es}`,
            dest: L(`${OUTPUT}/static/`),
            moduleId: file => {
                return `${NAMESPACE}:` + file.replace(new RegExp(`^${TMP_SRC}\\b`), SRC);
            },
            moduleUri: uri => `${NAMESPACE}/${uri}`,
            moduleDep: dep => {
                if (!dep) {
                    return dep;
                }
                return `${NAMESPACE}:` + path.relative(CWD, dep).replace(new RegExp(
                    `^${TMP_SRC}\\b`), SRC);
            }
        }, (err, resourceMap) => {
            if (err) {
                return reject(err);
            }
            W(`${OUTPUT}/resource-map.json`, JSON.stringify(resourceMap, null, 4));
            resolve();
        });
    });
}).then(() => {
    return new Promise((resolve, reject) => {
        MV(`${TMP_SRC}/`, `${OUTPUT}/app/${NAMESPACE}/`, err => {
            if (err) {
                reject(err)
            } else {
                resolve();
            }
        });
    });
}).catch(e => {
    error(e.message);
});