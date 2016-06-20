/**
 * Copyright (C) 2016 yanni4night.com
 * config.js
 *
 * changelog
 * 2016-06-16[19:28:48]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const path = require('path');
const minimatch = require('minimatch');

const extend = require('lodash/extend');

const NODE_MODULES = 'node_modules';

// 项目配置文件
const defaultConfig = {
    NAMESPACE: null,
    IGNORE: 'package.json,*.md,LICENSE,AUTHORS,bower.json',
    OUTPUT: 'output',
    SRC: 'src',
    CWD: '.',
    BINARY_RESOURCE: 'webp,png,jpg,jpeg,gif,bmp,tiff,swf,woff,woff2,ttf,eot,otf,cur,zip,gz,7z,gzip,tgz,lzh,lha,bz2,bzip2,tbz2,tbz,xz,txz,z,lzma,arj,cab,alz,egg,bh,jar,iso,img,udf,wim,rar,tar,bz2,apk,ipa,exe,pages,numbers,key,graffle,xmind,xls,xlsx,doc,docx,ppt,pptx,pot,potx,ppsx,pps,pptm,potm,ppsm,thmx,ppam,ppa,psd,dmg,pdf,rtf,dot,mht,dotm,docm,csv,xlt,xls,xltx,xla,xltm,xlsm,xlam,xlsb,slk,mobi,mp3,mp4,wma,rmvb,ogg,wav,aiff,midi,au,aac,flac,ape,avi,mov,asf,wmv,3gp,mkv,mov,flv,f4v,rmvb,webm,vob,rmf'
};

Object.freeze(defaultConfig);

module.exports = extend({}, defaultConfig, {
    NODE_MODULES,
    extend: opt => extend(module.exports, opt),
    isBinary: file => minimatch(path.basename(file), `*.{${module.exports.BINARY_RESOURCE}}`)
});
