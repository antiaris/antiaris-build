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

const CWD = process.argv[2] || process.cwd();
const npm = require('../npm/');
const path = require('path');
const rimraf = require('rimraf');
const fs = require('fs');
const glob = require('glob');
const cp = require('cp');
const mv = require('mv');
const mkdirp = require('mkdirp');
const yaml = require('js-yaml');
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
    output: 'output',
    src: 'src',
    binary_resource: 'png,jpg,jpeg,gif,bmp,swf,woff,woff2,ttf,eot,otf,cur'
}, yaml.safeLoad(R('antiaris.yml')));

// 全局命名空间
const NAMESPACE = CONFIG.name;

if (!isString(NAMESPACE) || !/^\w+$/.test(NAMESPACE)) {
    throw new Error(`A valid name has to be defined in antiaris.yml`);
}

// 编译后输出目录
const OUTPUT = (isString(CONFIG.output) && !/^\w+$/.test(CONFIG.output)) ? CONFIG.output : 'output';

// 源代码目录
const SRC = (isString(CONFIG.src) && !/^\w+$/.test(CONFIG.src)) ? CONFIG.src : 'src';

const TMP_SRC = NAMESPACE;

info(`Process [${NAMESPACE}] in ${CWD}`);

rimraf.sync(OUTPUT);
rimraf.sync(TMP_SRC);

Promise.resolve(0).then(() => {
    return new Promise((resolve, reject) => {
        info('Compiling static binary resource...');
        glob(`{${SRC},${NODE_MODULES}}/**/*.{${CONFIG.binary_resource}}`, {
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