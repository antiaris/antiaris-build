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
const AspectTransformer = require('panto-transformer-aspect');
const ResourceTransformer = require('panto-transformer-resource');

module.exports = (panto, conf) => {

    const Stream = panto.Stream;

    const {
        node_modules,
        namespace,
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
            if (file.deps) {
                resourceMap.set(`${namespace}:${file.filename}`, {
                    deps: file.deps
                });
            }
        }
    };

    const GET_RES = extend({}, conf, {
        getResourceAlias: name => {
            const moduleId = `${namespace}:${name}`;
            return resourceMap.has(moduleId) ? ('/' + resourceMap.get(moduleId).get('uri')) : null;
        }
    });

    const isSkip = isDev;

    const resourceMap = new ResourceMap();

    panto.loadTransformer('systemjs', SystemjsTransformer);

    // rest
    panto.rest().tag('rest').ignore({
        exclude: `**/{${ignore}}`
    }).read().write(WRITE_ORIGIN);

    // node_modules
    const nodeModules = panto.$(`${node_modules}/**/*.{js,json}`, true).tag('node_modules').read();

    nodeModules.write(WRITE_ORIGIN);

    nodeModules.systemjs(extend({}, conf, {
        ignoreError: true,
        isSilent: true,
        isCacheable: true
    })).uglify({
        ignoreError: true,
        isSlient: true,
        isSkip,
        isCacheable: true
    }).stamp({
        isCacheable: true
    }).aspect(SET_RES_MAP).write(WRITE_STATIC);

    // binary
    const binaryAspectStream = new Stream(new AspectTransformer(SET_RES_MAP));

    panto.pick(`src/**/*.{${binary_resource}}`).tag('binary').read().stamp({
        isCacheable: true
    }).connect(binaryAspectStream).write(WRITE_STATIC);

   // html resource
    const tpl = panto.pick(`src/**/*.{html,htm,shtml,xhtml,tpl}`).tag('html').read();
    
    tpl.stamp({
        isCacheable: true
    }).aspect(SET_RES_MAP).write(WRITE_STATIC);

    const srcJs = panto.pick(`src/**/*.{js,jsx}`).tag('src js').read();
    // server js
    srcJs.babel({
        isSkip: 'src/lib/**/*.js',
        babelOptions: {
            "extends": path.join(__dirname, '..', '.babelrc-server')
        },
        isCacheable: true
    }).write(WRITE_ORIGIN);

    // css
    const cssAspectStream = new Stream(new AspectTransformer(SET_RES_MAP));
    const cssResourceStream = new Stream(new ResourceTransformer(GET_RES));
    
    binaryAspectStream.connect(cssResourceStream);
    
    panto.pick(`src/**/*.{css,less}`).tag('css').read().less({
        isCacheable: true
    }).connect(cssResourceStream).stamp({
        isCacheable: true
    }).connect(cssAspectStream).write(WRITE_STATIC);

    // client js 
    const srcClientAspectStream = new Stream(new AspectTransformer(SET_RES_MAP));
    
    srcJs.babel({
        isSkip: 'src/lib/**/*.js',
        babelOptions: {
            extends: path.join(__dirname, '..', '.babelrc-client')
        },
        isCacheable: true
    }).systemjs(extend({}, conf, {
        ignoreError: true,
        isSilent: false,
        isSkip: 'src/lib/**/*.js',
        isCacheable: true
    })).uglify({
        isSlient: true,
        isCacheable: true
    }).stamp({
        isCacheable: true
    }).connect(srcClientAspectStream).write(WRITE_STATIC);

    const htmlTemplateResourceStream = new Stream(new ResourceTransformer(GET_RES));

    binaryAspectStream.connect(htmlTemplateResourceStream, false);
    cssAspectStream.connect(htmlTemplateResourceStream, false);
    srcClientAspectStream.connect(htmlTemplateResourceStream, false);
    
    tpl.connect(htmlTemplateResourceStream).write(WRITE_ORIGIN);

    panto.on('complete', () => {
        panto.file.write(`${namespace}/resource-map.json`, resourceMap.toJSONString());
        panto.log.info('resource-map.json created');
    }).on('error', err => panto.log.error(err));
};