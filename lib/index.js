/**
 * Copyright (C) 2016 yanni4night.com
 * index.js
 *
 * changelog
 * 2016-06-16[19:10:36]:revised
 * 2016-06-19[02:03:45]:streaming
 *
 * @author yanni4night@gmail.com
 * @version 2.0.0
 * @since 1.0.0
 */
'use strict';

const rimraf = require('rimraf');
const yaml = require('js-yaml');
const {
    error
} = require('antiaris-logger');

const conf = require('./config');

conf.extend({CWD:process.cwd()});

const {R} = require('./shortcut');

conf.extend(yaml.safeLoad(R.sync('antiaris.yml')));

const sieve = require('./sieve');

rimraf.sync(conf.OUTPUT);

sieve.init(require('./default-conf')).build().then(() => {
    sieve.watch();
}).catch(err => {
    error(err.message);
});