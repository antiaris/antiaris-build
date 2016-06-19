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
const UglifyTransformer = require('./uglify-transformer');
const IntegrityTransformer = require('./integrity-transformer');
const IgnoreTransformer = require('./ignore-transformer');
const ReadTransformer = require('./read-transformer');

module.exports = {
    Transformer,
    SystemTransformer,
    BabelTransformer,
    StampTransformer,
    NoopTransformer,
    LessTransformer,
    UglifyTransformer,
    IntegrityTransformer,
    IgnoreTransformer,
    ReadTransformer
};