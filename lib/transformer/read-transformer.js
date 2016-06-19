/**
  * Copyright (C) 2016 yanni4night.com
  * read-transformer.js
  *
  * changelog
  * 2016-06-19[08:41:50]:revised
  *
  * @author yanni4night@gmail.com
  * @version 0.1.0
  * @since 0.1.0
  */

'use strict';

const Transformer = require('./transformer');

const {
    isBinary,
    R,
    NAMESPACE
} = require('../config');
const extend = require('lodash/extend');

class ReadTransformer extends Transformer {
    _transform(seed) {
        const {
            file,
            content
        } = seed;
        if (content !== null && content !== undefined) {
            return Promise.resolve(extend({}, seed));
        } else {
            return R(file, isBinary(file)).then(content => {
                return extend({}, seed, {
                    content,
                    moduleId: `${NAMESPACE}/${file}`
                });
            });
        }
    }
}

module.exports = ReadTransformer;