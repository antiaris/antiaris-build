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
    const SLIENT = 1 << 2;
    const options = {
        STRICT,
        SKIP,
        SLIENT
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
    })).pipe(sieve.stamp(boolOptions(STRICT))).end('Binary');

    sieve.src(`${SRC}/**/*.{css,less}`).pipe(sieve.less(boolOptions(STRICT))).pipe(sieve.integrity(boolOptions(SKIP))).pipe(sieve.stamp(boolOptions(STRICT))).end('CSS');

    const tpl = sieve.src(`**/*.{html,htm,shtml,xhtml,tpl}`);
    tpl.pipe(sieve.stamp(boolOptions(STRICT))).end('HTML resource');

    const src = sieve.src(`${SRC}/**/*.{js,jsx}`).pipe(sieve.babel(boolOptions(STRICT)));
    src.pipe(sieve.noop()).end('SRC server js');
    src.pipe(sieve.system(boolOptions(STRICT))).pipe(sieve.uglify(boolOptions(STRICT | SKIP))).pipe(sieve.integrity(boolOptions(SKIP))).pipe(sieve.stamp(boolOptions(STRICT))).end('SRC client js');

    tpl.pipe(sieve.noop()).end('HTML template');

    const nodeModules = sieve.src(`${NODE_MODULES}/**/*.{js,jsx}`);
    nodeModules.pipe(sieve.noop()).end('node_modules server js');
    nodeModules.pipe(sieve.system(boolOptions(SLIENT))).pipe(sieve.uglify(boolOptions(SKIP))).pipe(sieve.integrity(boolOptions(SKIP))).pipe(sieve.stamp()).end('node_modules client js');

};