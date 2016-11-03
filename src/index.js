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

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const panto = require('panto');

const CWD = process.cwd();

const config = yaml.safeLoad(fs.readFileSync(path.join(CWD, 'antiaris.yml'), 'utf-8'));

const conf = panto.util.extend({}, config, {
    cwd: CWD,
    src: '.',
    ouput: 'output'
});
// Set options
panto.setOptions(conf);

require('time-panto')(panto);

require('load-panto-transformers')(panto, {
    config: require('../package.json')
});

// Register stream
require('./config')(panto, panto._.extend({
    node_modules: 'node_modules',
    isDev: process.env.NODE_ENV !== 'production'
}, conf));

// Final build * watch
panto.build().then(() => {
    panto.watch();
});