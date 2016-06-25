/**
 * Copyright (C) 2016 antiaris.xyz
 * config.js
 *
 * changelog
 * 2016-06-23[11:19:05]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const path = require('path');
const SystemjsTransformer = require('./panto-transformer-systemjs');

module.exports = (panto, conf) => {

    const {
        node_modules,
        namespace,
        src,
        ignore,
        binary_resource,
        isDev
    } = conf;

    const {
        extend
    } = panto.util;

    const isSkip = isDev;

    panto.loadTransformer('systemjs', SystemjsTransformer);

    // rest
    panto.rest().pipe(panto.ignore({
        exclude: `**/{${ignore}}`
    })).pipe(panto.write({
        destname: file => `${namespace}/${file.filename}`
    })).end('Others');

    // node_modules
    const nodeModules = panto.pick(`${node_modules}/**/*.js`).pipe(panto.read());
    nodeModules.pipe(panto.write({
        destname: file => `${namespace}/${file.filename}`
    })).end('node_modules server js');
    nodeModules.pipe(panto.systemjs(extend({}, conf, {
        ignoreError: true,
        isSilent: true
    }))).pipe(panto.uglify({
        ignoreError: true,
        isSkip
    })).pipe(panto.integrity()).pipe(panto.stamp()).pipe(
        panto.write({
            destname: file => path.join('static', namespace, file.stamp)
        })).end('node_modules client js');

    // binary
    panto.pick(`**/*.{${binary_resource}}`).pipe(panto.read()).pipe(panto.stamp()).pipe(panto.write({
        destname: file => path.join('static', namespace, file.stamp)
    })).end('Binary');

    // html resource
    const tpl = panto.pick(`**/*.{html,htm,shtml,xhtml,tpl}`).pipe(panto.read());
    tpl.pipe(panto.stamp()).pipe(panto.write({
        destname: file => path.join('static', namespace, file.stamp)
    })).end('HTML resource');

    const srcJs = panto.pick(`${src}/**/*.{js,jsx}`).pipe(panto.read());
    // server js
    srcJs.pipe(panto.babel({
        babelOptions: {
            "extends": path.join(__dirname, '..', '.babelrc-server')
        }
    })).pipe(panto.write({
        destname: file => `${namespace}/${file.filename}`
    })).end('SRC server js');

    // css
    panto.pick(`${src}/**/*.{css,less}`).pipe(panto.read()).pipe(panto.less()).pipe(panto.integrity()).pipe(panto.stamp())
        .pipe(panto.write({
            destname: file => path.join('static', namespace, file.stamp)
        })).end('CSS');

    // client js 
    srcJs.pipe(panto.babel({
            babelOptions: {
                extends: path.join(__dirname, '..', '.babelrc-client')
            }
        })).pipe(panto.systemjs(extend({}, conf, {
            ignoreError: true,
            isSilent: false
        }))).pipe(panto.uglify({
            isSkip
        })).pipe(panto.integrity()).pipe(panto.stamp()).pipe(panto.write({
            destname: file => path.join('static', namespace, file.stamp)
        }))
        .end('SRC client js');

    // html template
    tpl.pipe(panto.write({
        destname: file => `${namespace}/${file.filename}`
    })).end('HTML template');
};