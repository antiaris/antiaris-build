/**
 * Copyright (C) 2016 yanni4night.com
 * integrity-transformer.js
 *
 * changelog
 * 2016-06-17[23:28:09]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');
const crypto = require('crypto');

class IntegrityTransformer extends Transformer {
    _transform(file) {
        let {
            content
        } = file;
        return new Promise(resolve => {
            const sum = crypto.createHash('sha384').update(content).digest().toString('base64');

            file.setResource('integrity', `sha384-${sum}`);
            resolve(file);
        });
    }
}

module.exports = IntegrityTransformer;