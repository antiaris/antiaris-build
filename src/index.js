/**
 * Copyright (C) 2016 antiaris.xyz
 * index.js
 *
 * changelog
 * 2016-06-23[11:23:30]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
'use strict';

const rimraf = require('rimraf');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const panto = require('panto');

const CWD = process.cwd();

const config = yaml.safeLoad(fs.readFileSync(path.join(CWD, 'antiaris.yml'), 'utf-8'));

// Remove output directory FIRST
rimraf.sync(config.output);

const conf = panto.util.extend({}, config, {
    cwd: CWD
});
// Set options
panto.setOptions();

panto.loadTransformer('read', require('panto-transformer-read'));
panto.loadTransformer('write', require('panto-transformer-write'));
panto.loadTransformer('babel', require('panto-transformer-babel'));
panto.loadTransformer('filter', require('panto-transformer-filter'));
panto.loadTransformer('ignore', require('panto-transformer-ignore'));
panto.loadTransformer('integrity', require('panto-transformer-integrity'));
panto.loadTransformer('less', require('panto-transformer-less'));
panto.loadTransformer('uglify', require('panto-transformer-uglify'));
panto.loadTransformer('stamp', require('panto-transformer-stamp'));
panto.loadTransformer('aspect', require('panto-transformer-aspect'));

// Register stream
require('./config')(panto, panto.util.extend({
    node_modules: 'node_modules',
    isDev: process.env.NODE_ENV !== 'production'
}, conf));

panto.on('error' , err => panto.log.error(err.message));

// Final build * watch
panto.build().then(() => {
    panto.watch();
});