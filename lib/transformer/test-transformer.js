/**
 * Copyright (C) 2016 yanni4night.com
 * test-transformer.js
 *
 * changelog
 * 2016-06-17[14:59:26]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');


class TestTransformer extends Transformer {
    constructor(name, isStrict) {
        super(isStrict);
        this.name = name;
    }
    _transform(prename) {
        return new Promise(resolve => {
            resolve(prename+ '/' + this.name);
        });
    }
}

module.exports = TestTransformer;