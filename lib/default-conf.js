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
    NODE_MODULES,
    BINARY_RESOURCE //,
    //IGNORE
} = require('./config');

module.exports = sieve => {

    const STRICT = 1;
    const SKIP = 1 << 1;
    const options = {
        STRICT,
        SKIP
    };

    const boolOptions = num => {
        const ret = {}
        for (let opt in options) {
            if (options[opt] & num) {
                ret['is' + opt.toLowerCase().replace(/^\w/, n => n.toUpperCase())] = true;
            }
        }
        return ret;
    };

    //sieve.src('**/*.*').end();
    //sieve.src(`**/${IGNORE}`).pipe(sieve.ignore()).end();

    sieve.src(`**/*.{${BINARY_RESOURCE}}`).pipe(sieve.ignore({
        exclude: '**/*.{zip,rar}'
    })).pipe(sieve.stamp(boolOptions(STRICT))).end();

    sieve.src(`${SRC}/**/*.{css,less}`).pipe(sieve.less(boolOptions(STRICT))).pipe(sieve.integrity(boolOptions(SKIP))).pipe(sieve.stamp(boolOptions(STRICT))).end();

    const tpl = sieve.src(`**/*.{html,htm,shtml,xhtml,tpl}`);
    tpl.pipe(sieve.stamp(boolOptions(STRICT))).end();

    const src = sieve.src(`${SRC}/**/*.{js,jsx}`).pipe(sieve.babel(boolOptions(STRICT)));
    src.pipe(sieve.noop()).end();
    src.pipe(sieve.system(boolOptions(STRICT))).pipe(sieve.uglify(boolOptions(STRICT | SKIP))).pipe(sieve.integrity(boolOptions(SKIP))).pipe(sieve.stamp(boolOptions(STRICT))).end();

    tpl.end();

    const nodeModules = sieve.src(`${NODE_MODULES}/**/*.{js,jsx}`);
    nodeModules.end();
    nodeModules.pipe(sieve.system()).pipe(sieve.uglify(boolOptions(SKIP))).pipe(sieve.integrity(boolOptions(SKIP))).pipe(sieve.stamp()).end();

};