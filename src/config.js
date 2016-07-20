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
const ResourceMap = require('./resource-map');
const SystemjsTransformer = require('./panto-transformer-systemjs');
const ResourceTransformer = require('./panto-transformer-resource');

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
    } = panto._;

    const WRITE_ORIGIN = {
        destname: file => `${namespace}/${file.filename}`
    };

    const WRITE_STATIC = {
        destname: file => path.join('static', namespace, file.stamp)
    };

    const SET_RES_MAP = {
        aspect: file => {
            if (file.stamp) {
                resourceMap.set(`${namespace}:${file.filename}`, {
                    uri: `${namespace}/${file.stamp}`
                });
            }
            if (file.integrity) {
                resourceMap.set(`${namespace}:${file.filename}`, {
                    integrity: file.integrity
                });
            }
            if (file.deps) {
                resourceMap.set(`${namespace}:${file.filename}`, {
                    deps: file.deps
                });
            }
        }
    };

    const isSkip = isDev;

    const resourceMap = new ResourceMap();

    panto.loadTransformer('systemjs', SystemjsTransformer);
    panto.loadTransformer('resource', ResourceTransformer);

    // rest
    panto.rest().tag('rest').ignore({
        exclude: `**/{${ignore}}`
    }).read().write(WRITE_ORIGIN);

    // node_modules
    const nodeModules = panto.pick(`${node_modules}/**/*.js`).tag('node_modules').read();

    nodeModules.write(WRITE_ORIGIN);

    nodeModules.systemjs(extend({}, conf, {
        ignoreError: true,
        isSilent: true
    })).uglify({
        ignoreError: true,
        isSlient: true,
        isSkip
    }).integrity().stamp().aspect(SET_RES_MAP).write(WRITE_STATIC);

    // binary
    panto.pick(`**/*.{${binary_resource}}`).tag('binary').read().stamp().write(WRITE_STATIC);

    // html resource
    const tpl = panto.pick(`src/**/*.{html,htm,shtml,xhtml,tpl}`).tag('html as static').read();
    tpl.stamp().aspect(SET_RES_MAP).write(WRITE_STATIC);

    const srcJs = panto.pick(`${src}/**/*.{js,jsx}`).tag('src js').read();
    // server js
    srcJs.babel({
        babelOptions: {
            "extends": path.join(__dirname, '..', '.babelrc-server')
        }
    }).write(WRITE_ORIGIN);

    // css
    panto.pick(`${src}/**/*.{css,less}`).tag('css').read().less().integrity().stamp()
        .aspect(SET_RES_MAP).write(WRITE_STATIC);

    // client js 
    srcJs.babel({
        isSkip: 'src/lib/**/*.js',
        babelOptions: {
            extends: path.join(__dirname, '..', '.babelrc-client')
        }
    }).systemjs(extend({}, conf, {
        ignoreError: true,
        isSilent: false,
        exculde: 'src/lib/**/*.js'
    })).uglify({isSlient:true}).integrity().stamp().aspect(SET_RES_MAP).write(WRITE_STATIC);

    // html template
    tpl.resource(extend(conf, {
        getResourceStamp: name => {
            const moduleId = `${namespace}:${name}`;
            return resourceMap.get(moduleId) ? resourceMap.get(moduleId).uri : null;
        }
    })).write(WRITE_ORIGIN);

    panto.on('complete', () => {
        panto.file.write(`${namespace}/resource-map.json`, JSON.stringify(resourceMap._map, null, 4));
        panto.log.info('resource-map.json created');
    });
};