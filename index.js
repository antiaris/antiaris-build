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
const mkdirp = require('mkdirp');
const yaml = require('js-yaml');
const isString = require('lodash/isString');
require('colors');

const NODE_MODULES = 'node_modules';

function L(name) {
    return path.join(CWD, name);
}

function R(name) {
    return fs.readFileSync(L(name), 'utf-8');
}

const CONFIG = yaml.safeLoad(R('antiaris.yml'));

const NAMESPACE = CONFIG.name;

if (!isString(NAMESPACE) || !/^\w+$/.test(NAMESPACE)) {
    throw new Error(`A valid name has to be defined in antiaris.yml`);
}

const OUTPUT = (isString(CONFIG.output)&&!/^\w+$/.test(CONFIG.output)) ? CONFIG.output: 'output';

console.log(`Process [${NAMESPACE}] in ${CWD}`.green);

rimraf.sync(OUTPUT);

npm(L(NODE_MODULES), {
    dest: L(`${OUTPUT}/${NAMESPACE}`),
    moduleId: file => {
        return `${NAMESPACE}:${NODE_MODULES}/${file}`;
    },
    moduleDep: dep => {
        if (!dep) {
            return dep;
        }
        return `${NAMESPACE}:${NODE_MODULES}/` + path.relative(L(NODE_MODULES), dep)
    }
}, (err, resourceMap) => {
    fs.writeFileSync(L(`${OUTPUT}/resource-map.json`), JSON.stringify(resourceMap, null,
        4));
});