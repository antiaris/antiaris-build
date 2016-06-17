/**
 * Copyright (C) 2016 yanni4night.com
 * noop-transformer.js
 *
 * changelog
 * 2016-06-17[17:04:37]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');


class NoopTransformer extends Transformer {
    constructor() {
        super();
    }
}

module.exports = NoopTransformer;