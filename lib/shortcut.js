/**
 * Copyright (C) 2016 yanni4night.com
 * shortcut.js
 *
 * changelog
 * 2016-06-20[21:29:37]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';

const {
    CWD
} = require('./config');

const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

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
    return fs.readFileSync(L(name), {
        encoding: isBinary ? null : 'utf-8'
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

module.exports = {
    L,
    R,
    W
};