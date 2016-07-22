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
process.env.PANTO_LOG_LEVEL = 'info';

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const panto = require('panto');

const CWD = process.cwd();

const config = yaml.safeLoad(fs.readFileSync(path.join(CWD, 'antiaris.yml'), 'utf-8'));

const conf = panto.util.extend({}, config, {
    cwd: CWD,
    src: '.'
});
// Set options
panto.setOptions(conf);

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
panto.loadTransformer('resource', require('panto-transformer-resource'));

// Register stream
require('./config')(panto, panto.util.extend({
    node_modules: 'node_modules',
    isDev: process.env.NODE_ENV !== 'production'
}, conf));

// Final build * watch
panto.build().then(() => {
    panto.watch();
});