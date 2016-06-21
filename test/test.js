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

const CONFIG = require('../lib/config');
const assert = require('assert');
const flattenDeep = require('lodash/flattenDeep');
const extend = require('lodash/extend');
const Transformer = require('../lib/transformer/transformer');
const File = require('../lib/file');
const FileCollection = require('../lib/file-collection');
const ResourceMap = require('../lib/resource-map');
const Stream = require('../lib/stream');

class TestTransformer extends Transformer {
    _transform(file) {
        const {
            content
        } = file;
        return new Promise(resolve => {
            resolve(file.update(content + content));
        });
    }
}

class MultiplyTransformer extends Transformer {
    _transform(file) {
        const {
            content
        } = file;
        return new Promise(resolve => {
            resolve([
                file.clone(),
                file.clone().update(content + content)
            ]);
        });
    }
}

describe('file', () => {
    describe('#constructor', () => {
        it('should get right filename, destname, content and moduleId', () => {
            const file = new File('a.js', 'content');
            assert.deepEqual(file.filename, 'a.js');
            assert.deepEqual(file.content, 'content');
            assert.deepEqual(file.destname, 'a.js');
            assert.deepEqual(file.moduleId, 'null:a.js');
        });
        it('should not override filename and moduleId', () => {
            const file = new File('a.js', 'content');
            assert.throws(() => {
                file.filename = 'b.js'
            });
            assert.throws(() => {
                file.moduleId = 'test:b.js'
            });
        });
    });
    describe('#clone', () => {
        it('should clone own filename and content', () => {
            const res = {
                deps: []
            };
            const file = new File('a.js', 'content', 'b.js', res);
            let clonedFile = file.clone();
            assert.deepEqual(clonedFile.filename, 'a.js');
            assert.deepEqual(clonedFile.content, 'content');
            assert.deepEqual(clonedFile.destname, 'b.js');
            assert.deepEqual(clonedFile.resource, res);
        });
    });
    describe('#update', () => {
        it('should update content', () => {
            const file = new File('a.js', 'content');
            file.update('summary');
            assert.deepEqual(file.content, 'summary');
        });
    });
    describe('#truncate', () => {
        it('should make content null', () => {
            const file = new File('a.js', 'content');
            file.truncate();
            assert.deepEqual(file.content, null);
        });
    });
});

describe('file-collection', () => {
    describe('#constructor', () => {
        it('should define fileObjects', () => {
            const fc = new FileCollection();
            assert.ok('fileObjects' in fc);
        });
        it('should make fileObjects sealed', () => {
            const fc = new FileCollection();
            assert.throws(() => {
                fc.fileObjects = 1;
            });
            assert.throws(() => {
                delete fc.fileObjects;
            });
        });
        it('should fill fileObjects with filenames', () => {
            const fc = new FileCollection('a.js', 'b.js');
            assert.ok('a.js' in fc.fileObjects, 'a.js in fileObjects');
            assert.deepEqual(fc.fileObjects['a.js'].filename, 'a.js');
            assert.deepEqual(fc.fileObjects['a.js'].destname, 'a.js');
            assert.deepEqual(fc.fileObjects['a.js'].content, undefined);
            assert.deepEqual(fc.fileObjects['a.js'].moduleId, 'null:a.js');
            assert.ok('resource' in fc.fileObjects['a.js']);

            assert.ok('b.js' in fc.fileObjects, 'b.js in fileObjects');
        });
    });
    describe('#from', () => {
        it('should fill fileObjects', () => {
            const fc = new FileCollection();
            fc.from('a.js', 'b.js');
            assert.ok('a.js' in fc.fileObjects, 'a.js in fileObjects');
            assert.deepEqual(fc.fileObjects['a.js'].filename, 'a.js');
            assert.deepEqual(fc.fileObjects['a.js'].destname, 'a.js');
            assert.ok('b.js' in fc.fileObjects, 'b.js in fileObjects');
        });
    });
    describe('#has', () => {
        it('should return true if contains it', () => {
            const fc = new FileCollection('a.js', 'b.js');
            assert.ok(fc.has('a.js'));
            assert.ok(fc.has('b.js'));
            assert.ok(!fc.has('c.js'));
        });
    });
    describe('#get', () => {
        it('should get if contains it', () => {
            const fc = new FileCollection('a.js', 'b.js');
            assert.deepEqual(fc.get('a.js').filename, 'a.js');
            assert.deepEqual(fc.get('c.js'), undefined);
        });
    });
    describe('#add', () => {
        it('should add it', () => {
            const fc = new FileCollection();
            fc.add(new File('a.js'));
            assert.ok(fc.has('a.js'));
        });
        it('should not add it if exists', () => {
            const fc = new FileCollection('a.js');
            fc.add(new File('a.js', 'content'));
            assert.deepEqual(fc.get('a.js').content, undefined);
        });
        it('should add it even if exists when force', () => {
            const fc = new FileCollection('a.js');
            fc.add(new File('a.js', 'content'), true);
            assert.deepEqual(fc.get('a.js').content, 'content');
        });
    });
    describe('#remove', () => {
        it('should remove it if contains it', () => {
            const fc = new FileCollection('a.js');
            fc.remove('a.js');
            assert.ok(!fc.has('a.js'));
        });
    });
    describe('#refresh', () => {
        it('should truncate  the file', () => {
            const fc = new FileCollection();
            fc.add(new File('a.js', 'content'));
            fc.refresh('a.js');
            assert.deepEqual(fc.get('a.js').content, null);
        });
    });
});


describe('resource-map', () => {
    describe('#constructor', () => {
        it('should define map', () => {
            const rm = new ResourceMap();
            assert.ok('map' in rm);
        });
        it('should make map sealed', () => {
            const rm = new ResourceMap();
            assert.throws(() => {
                rm.map = 1;
            });
            assert.throws(() => {
                delete rm.map;
            });
        });
    });
    describe('#set', () => {
        it('should set', () => {
            const rm = new ResourceMap();
            rm.set('id', {
                name: 'jake'
            });
            rm.set('id', {
                age: '28'
            });
            assert.ok('id' in rm.map);
            assert.deepEqual(rm.map.id, {
                name: 'jake',
                age: '28'
            });
        });
    });
    describe('#remove', () => {
        it('should remove all if no key', () => {
            const rm = new ResourceMap();
            rm.set('id', {
                name: 'jake'
            });
            rm.remove('id');
            assert.ok(!('id' in rm.map));
        });
        it('should remove key', () => {
            const rm = new ResourceMap();
            rm.set('id', {
                name: 'jake'
            });
            rm.remove('id', 'name');
            assert.ok('id' in rm.map);
            assert.ok(!('name' in rm.map.id));
        });
    });
});

describe('transformer', () => {
    describe('#transform', () => {
        it('should make content transformed', done => {
            const t = new TestTransformer();
            t.transform(new File('a.js', 'a')).then(file => {
                assert.deepEqual(file.content, 'aa');
            }).then(() => {
                done();
            }).catch(e => {
                console.error(e)
            });
        });
        it('should skip if content is null', done => {
            const t = new TestTransformer();
            t.transform(new File('b.js', null)).then(file => {
                assert.deepEqual(file.content, null);
                done();
            }).catch(e => {
                console.error(e)
            });
        });
    });
});

describe('stream', () => {
    describe('#constructor', () => {
        it('should define sealed parent,pattern,transformer,cacheFiles,resourceMap', () => {
            const s = new Stream();
            assert.ok('parent' in s);
            assert.ok('pattern' in s);
            assert.ok('transformer' in s);
            assert.ok('cacheFiles' in s);
            assert.throws(() => {
                s.parent = 1;
            });
            assert.throws(() => {
                delete s.parent;
            });
            assert.throws(() => {
                s.pattern = 1;
            });
            assert.throws(() => {
                delete s.pattern;
            });
            assert.throws(() => {
                s.transformer = 1;
            });
            assert.throws(() => {
                delete s.transformer;
            });
            assert.throws(() => {
                s.cacheFiles = 1;
            });
            assert.throws(() => {
                delete s.cacheFiles;
            });
        })
    });
    describe('#pipe', () => {
        it('should get another stream returned', () => {
            const s = new Stream();
            const rs = s.pipe(new Transformer());
            assert.ok(s !== rs);
            assert.ok(rs instanceof Stream);
        });

        it('should pass this as the parent', () => {
            const s = new Stream();
            const rs = s.pipe(new Transformer());
            assert.ok(s === rs.parent);
        });

        it('should pass own pattern', () => {
            const s = new Stream();
            const rs = s.pipe(new Transformer());
            assert.ok(s.pattern === rs.pattern);
        });

        it('should pass the transformer', () => {
            const s = new Stream();
            const tr = new Transformer();
            const rs = s.pipe(tr);
            assert.ok(tr, rs.transformer);
        });

        it('bubble up "end" event', done => {
            const s = new Stream();
            const rs = s.pipe(new Transformer());
            s.on('end', () => {
                done();
            });
            rs.emit('end');
        });
    });
    describe('#match', () => {
        it('should match the file', () => {
            const s = new Stream(null, '*.jpg');
            assert.ok(s.match('a.jpg'));
        });
    });
    describe('#flow', done => {
        it('transform using own transformer if no parent', done => {
            const s = new Stream(null, '', new TestTransformer());
            s.flow([new File('a.js', 'a')]).then((...files) => {
                const args = flattenDeep(files);
                assert.ok(Array.isArray(args));
                assert.ok(args[0].content, 'aa');
            }).then(() => {
                done();
            }, e => console.error.bind(console));
        });
        it('transform to the ancestor', done => {
            const s = new Stream(null, '', new TestTransformer());
            s.pipe(new TestTransformer()).pipe(new TestTransformer()).flow([new File('a.js',
                'a')]).then((...files) => {
                const args = flattenDeep(files);
                assert.ok(Array.isArray(args));
                assert.ok(args[0].content, 'aaaaaaaa');
            }).then(() => {
                done();
            }, e => console.error.bind(console));
        });
        it('should get multiple files', done => {
            const s = new Stream(null, '', new MultiplyTransformer());
            s.flow([new File('a.js', 'a')]).then(files => {
                assert.deepEqual(files[0].content, 'a');
                assert.deepEqual(files[1].content, 'aa');
                done();
            });
        });
    });
    describe('#end', () => {
        it('should set the name', () => {
            const s = new Stream();
            s.end('kate');
            assert.deepEqual(s.name, 'kate');
        });
        it('should emit "end" event', done => {
            const s = new Stream();
            s.on('end', () => {
                done();
            })
            s.end();
        });
        it('should emit "end" event to th ancestor', done => {
            const s = new Stream(null, '', new TestTransformer());
            const last = s.pipe(new TestTransformer()).pipe(new TestTransformer());
            s.on('end', leaf => {
                assert.deepEqual(leaf, last);
                done();
            })
            last.end();
        });
    });

});