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

const {
    SystemTransformer,
    BabelTransformer,
    StampTransformer,
    NoopTransformer,
    LessTransformer,
    UglifyTransformer,
    IntegrityTransformer,
    IgnoreTransformer
} = require('./transformer/');

module.exports = sieve => {

    const STRICT = {isStrict:true};

    sieve.src('**/*.*').end();
    sieve.src(`**/${IGNORE}`).pipe(new IgnoreTransformer()).end();

    sieve.src(`**/*.{${BINARY_RESOURCE}}`).pipe(new StampTransformer(STRICT)).end();

    sieve.src(`${SRC}/**/*.{css,less}`).pipe(new LessTransformer(STRICT)).pipe(new IntegrityTransformer()).pipe(new StampTransformer(STRICT)).end();

    const tpl = sieve.src(`**/*.{html,htm,shtml,xhtml,tpl}`);
    tpl.pipe(new StampTransformer(STRICT)).end();

    const src = sieve.src(`${SRC}/**/*.{js,jsx}`).pipe(new BabelTransformer(STRICT));
    src.pipe(new NoopTransformer()).end();
    src.pipe(new SystemTransformer(STRICT)).pipe(new UglifyTransformer(STRICT)).pipe(new IntegrityTransformer()).pipe(new StampTransformer(STRICT)).end();

    tpl.end();

    // const nodeModules = sieve.src(`${NODE_MODULES}/**/*.{js,jsx}`);
    // nodeModules.end();
    // nodeModules.pipe(new SystemTransformer()).pipe(new UglifyTransformer()).pipe(new IntegrityTransformer()).pipe(new StampTransformer()).end();

};