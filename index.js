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
const mv = require('mv');
const mkdirp = require('mkdirp');
const yaml = require('js-yaml');
const babel = require('babel-core');
const isString = require('lodash/isString');
const logger = require('antiaris-logger');

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

const CONFIG = yaml.safeLoad(R('antiaris.yml'));

const NAMESPACE = CONFIG.name;

if (!isString(NAMESPACE) || !/^\w+$/.test(NAMESPACE)) {
    throw new Error(`A valid name has to be defined in antiaris.yml`);
}

const OUTPUT = (isString(CONFIG.output) && !/^\w+$/.test(CONFIG.output)) ? CONFIG.output : 'output';
const SRC = (isString(CONFIG.src) && !/^\w+$/.test(CONFIG.src)) ? CONFIG.src : 'src';

const TMP_SRC = NAMESPACE;

logger.info(`Process [${NAMESPACE}] in ${CWD}`);

rimraf.sync(OUTPUT);
rimraf.sync(TMP_SRC);

new Promise((resolve, reject) => {
    logger.info('Compiling src...');
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
}).then(() => {
    logger.info('Compiling node_modules...');
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
            fs.writeFileSync(L(`${OUTPUT}/resource-map.json`), JSON.stringify(resourceMap, null,
                4));
            resolve();
        });
    });
}).then(() => {
    return new Promise((resolve, reject) => {
        mv(`${TMP_SRC}/`, `${OUTPUT}/app/${NAMESPACE}/`, {
            mkdirp: true
        }, err => {
            if (err) {
                reject(err)
            } else {
                resolve();
            }
        });
    });
}).catch(e => {
    logger.error(e.message);
});