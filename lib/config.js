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
const fs = require('fs');
const cp = require('cp');
const mv = require('mv');
const yaml = require('js-yaml');
const minimatch = require('minimatch');
const mkdirp = require('mkdirp');
const extend = require('lodash/extend');

const CWD = process.argv[2] || process.cwd();

const NODE_MODULES = 'node_modules';

function L(name) {
    return path.join(CWD, name);
}

const safeDirp = name => {
    const fpath = L(name);
    const dir = path.dirname(fpath);
    return new Promise(resolve => {
        fs.exists(dir, exist => {
            resolve(exist);
        });
    }).then(exist => {
        if (!exist) {
            return new Promise((resolve, reject) => {
                mkdirp(dir, err => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(fpath);
                    }
                });
            });
        } else {
            return fpath;
        }
    });
};

const R = (name, isBinary) => {
    return safeDirp(name).then(fpath => {
        return new Promise((resolve, reject) => {
            fs.readFile(fpath, {
                encoding: isBinary ? null : 'utf-8'
            }, (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });
    });
};

R.sync = (name, isBinary) => {
    return fs.readFileSync(L(name),{
        encoding: isBinary?null:'utf-8'
    });
};

const W = (name, content) => {
    return safeDirp(name).then(fpath => {
        return new Promise((resolve, reject) => {
            fs.writeFile(fpath, content, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
};

const MV = (src, dest) => {
    return new Promise((resolve, reject) => {
        mv(L(src), L(dest), {
            mkdirp: true
        }, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

const CP = (src, dest) => {
    return safeDirp(dest).then(destPath => {
        return new Promise((resolve, reject) => {
            cp(L(src), destPath, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    });
};

// 项目配置文件
const CONFIG = extend({
    NAMESPACE: null,
    IGNORE: 'package.json,*.md,LICENSE,AUTHORS,bower.json',
    OUTPUT: 'output',
    SRC: 'src',
    BINARY_RESOURCE: 'webp,png,jpg,jpeg,gif,bmp,swf,woff,woff2,ttf,eot,otf,cur'
}, yaml.safeLoad(R.sync('antiaris.yml')));

module.exports = extend({}, CONFIG, {
    L,
    R,
    W,
    MV,
    CP,
    CWD,
    NODE_MODULES,
    isBinary: file => minimatch(path.basename(file), `*.{${CONFIG.BINARY_RESOURCE}}`)
});
Object.freeze(module.exports);