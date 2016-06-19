/**
 * Copyright (C) 2016 yanni4night.com
 * test.js
 *
 * changelog
 * 2016-06-17[14:51:04]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const assert = require('assert');
const extend = require('lodash/extend');
const Transformer = require('../lib/transformer/transformer');

class TestTransformer extends Transformer {
    _transform(seed) {
        const {
            content
        } = seed;
        return new Promise(resolve => {
            resolve(extend({}, seed, {
                content: content + content
            }));
        });
    }
}

describe('antiaris-build', () => {
    describe('transformer', () => {
        it('#should make content transformed', done => {
            const t = new TestTransformer();
            t.transform({
                filename: 'a.js',
                content: 'a'
            }).then(seed => {
                assert.deepEqual(seed.content, 'aa');
                done();
            }).catch(e => {
                console.error(e)
            });
        });
        it('should skip if content is null', done => {
            const t = new TestTransformer();
            t.transform({
                filename: 'a.js',
                content: null
            }).then(seed => {
                assert.deepEqual(seed.content, null);
                done();
            }).catch(e => {
                console.error(e)
            });
        });
    });
});