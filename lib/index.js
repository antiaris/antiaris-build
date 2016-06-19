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
const sieve = require('./sieve');

const {
    error
} = require('antiaris-logger');
const {
    W,
    CWD,
    OUTPUT
} = require('./config');


rimraf.sync(OUTPUT);

sieve.ready(CWD, (err) => {

    if (err) {
        return error(err);
    }

    require('./default-conf')(sieve);

    sieve.build().catch(e => {
        /*eslint no-console: ["error", { allow: ["log", "error"] }]*/
        console.log(e);
    });
})