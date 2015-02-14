var assert = require('assert');
var express = require('express');
var request = require('request');
var batchMiddleware = require('../lib/call.js');

var TEST_PORT = 3488;
var TEST_ROOT = 'http://0.0.0.0:' + TEST_PORT + '/';

describe('Test server', function() {
    express().get('/', function (req, res) {
        res.json({ root: true });
    }).all('/batch',
        batchMiddleware
    ).get('/sample1', function (req, res) {
        res.json({ sample1: true });
    }).get('/sample2', function (req, res) {
        res.json({ sample2: true });
    }).listen(TEST_PORT);

    it('root should return JSON', function (done) {
        request.get({url: TEST_ROOT, json: true}, function (err, res, body) {
            assert.ok(body);
            assert.ok(body.root);
            assert.equal(true, body.root);
            done();
        });
    });

    it('batch with non-POST method should return error', function (done) {
        request.get({url: TEST_ROOT + 'batch', json: true}, function (err, res, body) {
            assert.equal(500, res.statusCode);
            assert.ok(body);
            assert.equal(batchMiddleware.ERROR_CODES.METHOD_MUST_BE_POST, body.trim());
            done();
        });
    });

    it('batch with non-Array body should return error', function (done) {
        request.post({url: TEST_ROOT + 'batch', json: true}, function (err, res, body) {
            assert.equal(500, res.statusCode);
            assert.ok(body);
            assert.equal(batchMiddleware.ERROR_CODES.BODY_MUST_BE_OBJECT, body.trim());
            done();
        });
    });

    it('batch with two calls should return result', function (done) {
        var requests = {
            first: { url: TEST_ROOT + 'sample1', json: true },
            second: { url: TEST_ROOT + 'sample2', json: true }
        };
        request.post({url: TEST_ROOT + 'batch', body: requests, json: true}, function (err, res, body) {
            assert.equal(200, res.statusCode);
            assert.ok(body);
            assert.ok(body.first.body);
            assert.ok(body.second.body);
            assert.equal(true, body.first.body.sample1);
            assert.equal(true, body.second.body.sample2);
            done();
        });
    });
});