/**
 * Copyright (C) 2016 yanni4night.com
 * index.js
 *
 * changelog
 * 2016-06-17[14:41:02]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const Transformer = require('./transformer');
const SystemTransformer = require('./system-transformer');
const BabelTransformer = require('./babel-transformer');
const StampTransformer = require('./stamp-transformer');
const NoopTransformer = require('./noop-transformer');
const LessTransformer = require('./less-transformer');
const TestTransformer = require('./test-transformer');

module.exports = {
    Transformer,
    SystemTransformer,
    BabelTransformer,
    StampTransformer,
    NoopTransformer,
    TestTransformer,
    LessTransformer
};