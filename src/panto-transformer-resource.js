/**
 * Copyright (C) 2016 antiaris.xyz
 * panto-transformer-resource.js
 *
 * changelog
 * 2016-06-26[10:19:37]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */
'use strict';
const sysurl = require('url');
const syspath = require('path');
const urljoin = require('urljoin');
const Transformer = require('panto-transformer');

const globalPattern = {
    'u': {
        pattern: /\burl\(\s*(['"])?(\s*\S+?\.(gif|bmp|jpe?g|ico|png|webp)\b(\?[^\)"']*)?\s*)\1?\s*\)/img,
        index: 2,
        whole: false
    },
    'l': {
        pattern: /<link[^>]*? href\s*=((['"])?(\s*\S+?\.css\b(\?[^\)"']*)?\s*)\2?)/img,
        index: 3,
        whole: false
    },
    's': {
        pattern: /<script[^>]*? src\s*=((['"])?(\s*\S+?\.js\b(\?[^\)"']*)?\s*)\2?)/img,
        index: 3,
        whole: false
    },
    'i': {
        pattern: /<img[^>]*? src\s*=((['"])?(\s*\S+?\.(gif|bmp|jpe?g|ico|png|webp)\b(\?[^\)"']*)?\s*)\2?)/img,
        index: 3,
        whole: false
    }
};

Object.freeze(globalPattern);

class ResourceTransformer extends Transformer {
    _transform(file) {
        let {
            filename,
            content
        } = file;

        const {
            getResourceStamp
        } = this.options;
        const urlOpts = this.options.url;

        const _stamp = function (url) {
            let prefix = urlOpts.static_prefix;
            let resname, aliasName;

            //Do trim
            url = String.prototype.trim.call(url);

            var parsedUrl = sysurl.parse(url, true);

            //search is used instead of query when formatting
            delete parsedUrl.search;

            if (parsedUrl.protocol || /^(?:#|\/\/)/i.test(url)) {
                //we ignore illegal urls or urls with protocol
                //we see '//' as a dynamic protocol
                return url;
            }

            if (!/^\//.test(parsedUrl.pathname)) {
                resname = syspath.join(syspath.dirname(filename), parsedUrl.pathname);
            } else {
                //absolute url
                return url;
            }

            aliasName = getResourceStamp(resname);

            if (!aliasName) {
                return url;
            }

            parsedUrl.pathname = aliasName;

            return prefix + sysurl.format(parsedUrl);

        };

        return new Promise(resolve => {

            const regex = globalPattern.s;
            const reg = regex.pattern;
            const index = regex.index;
            const whole = regex.whole;

            let matches, url, start, end;

            while ((matches = reg.exec(content))) {
                url = matches[whole ? 0 : index];
                start = matches.index + matches[0].indexOf(url);
                end = start + url.length;
                content = content.slice(0, start) + _stamp(matches[index]) + content.slice(end);
            }

            resolve(panto.util.extend(file, {
                content
            }));

        });
    }
}

module.exports = ResourceTransformer;