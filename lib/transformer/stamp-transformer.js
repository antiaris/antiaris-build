/**
 * Copyright (C) 2016 yanni4night.com
 * stamp-transformer.js
 *
 * changelog
 * 2016-06-17[14:19:57]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const Transformer = require('./transformer');
const {
    NAMESPACE
} = require('../config');

const {
    contentstamp
} = require('antiaris-filestamp');

class StampTransformer extends Transformer {
    _transform(file, resourceMap) {
        let {
            filename,
            content,
            moduleId
        } = file;
        let filepath = filename;
        return new Promise(resolve => {
            let {
                filename
            } = contentstamp.sync(content, filepath);

            filename = filename.replace(/\.jsx$/i, '.js');
            filename = filename.replace(/\.less$/i, '.css');

            resourceMap.set(moduleId, {
                uri: `${NAMESPACE}/${filename}`
            });

            file.destname = `../static/${filename}`;
            resolve(file);
        });
    }
}

module.exports = StampTransformer;