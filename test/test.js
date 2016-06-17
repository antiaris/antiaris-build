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
const TestTransformer = require('../lib/transformer/test-transformer');

describe('antiaris-build', () => {
    describe('transformer', () => {
        it('#test', done => {
            const t1 = new TestTransformer(1);
            const t2 = new TestTransformer(2);
            const t3 = new TestTransformer(3);
            const t4 = new TestTransformer(4);
            const t5 = new TestTransformer(5);
            const t6 = new TestTransformer(6);
            const t7 = new TestTransformer(7);
            t1.next(t2.next(t3.next(t5)), t4.next(t6), t7).transform(0).then((...args) => {
                assert.deepEqual(args[0], ['0/1/2/3/5', '0/1/4/6', '0/1/7']);
            }).then(() => {
                done();
            }).catch(e => {
                console.error(e);
            });
        });
    });
});