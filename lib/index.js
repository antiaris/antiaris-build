/**
 * Copyright (C) 2016 yanni4night.com
 * index.js
 *
 * changelog
 * 2016-06-16[19:10:36]:revised
 * 2016-06-19[02:03:45]:screaming
 *
 * @author yanni4night@gmail.com
 * @version 2.0.0
 * @since 1.0.0
 */
'use strict';

const rimraf = require('rimraf');
const extend = require('lodash/extend');
const yaml = require('js-yaml');
const {
    error
} = require('antiaris-logger');
const defaultConf = require('./config');



const CONFIG = extend(defaultConf, yaml.safeLoad(defaultConf.R.sync('antiaris.yml')));

const {
    OUTPUT
} = CONFIG;

rimraf.sync(OUTPUT);
const sieve = require('./sieve');

sieve.build(require('./default-conf')).catch(err => {
    error(err.message);
});