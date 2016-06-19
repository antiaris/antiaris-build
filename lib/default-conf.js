/**
 * Copyright (C) 2016 yanni4night.com
 * default-conf.js
 *
 * changelog
 * 2016-06-19[08:47:21]:revised
 *
 * @author yanni4night@gmail.com
 * @version 0.1.0
 * @since 0.1.0
 */
'use strict';
const {
    SRC,
    BINARY_RESOURCE,
    IGNORE
} = require('./config');

module.exports = sieve => {

    const STRICT = {isStrict:true};

    sieve.src('**/*.*').end();
    sieve.src(`**/${IGNORE}`).pipe(sieve.ignore()).end();

    sieve.src(`**/*.{${BINARY_RESOURCE}}`).pipe(sieve.stamp(STRICT)).end();

    sieve.src(`${SRC}/**/*.{css,less}`).pipe(sieve.less(STRICT)).pipe(sieve.integrity()).pipe(sieve.stamp(STRICT)).end();

    const tpl = sieve.src(`**/*.{html,htm,shtml,xhtml,tpl}`);
    tpl.pipe(sieve.stamp(STRICT)).end();

    const src = sieve.src(`${SRC}/**/*.{js,jsx}`).pipe(sieve.babel(STRICT));
    src.pipe(sieve.noop()).end();
    src.pipe(sieve.system(STRICT)).pipe(sieve.uglify(STRICT)).pipe(sieve.integrity()).pipe(sieve.stamp(STRICT)).end();

    tpl.end();

    // const nodeModules = sieve.src(`${NODE_MODULES}/**/*.{js,jsx}`);
    // nodeModules.end();
    // nodeModules.pipe(sieve.System()).pipe(sieve.Uglify()).pipe(sieve.Integrity()).pipe(sieve.Stamp()).end();

};