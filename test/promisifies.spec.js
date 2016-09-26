'use strict'

var chai = require('chai')
var sinon = require('sinon')
var fs = require('fs')
var ThenCatch = require('..')
var util = require('./util')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('promisifies()', function () {
  var sandbox, fsPromise

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    fsPromise = ThenCatch.promisifies(fs)
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('converts all nodeback-styled function to return Promise', function (done) {
    expect(fsPromise.readdir(__dirname)).to.be.an.instanceOf(Promise)
    expect(fsPromise.readFile(__filename)).to.be.an.instanceOf(Promise)

    done()
  })

  it('still passes the returned value into callback if the callback function specified', function (done) {
    fsPromise.readdir(__dirname, function (_, dir) {
      expect(dir).to.be.an('array')
      done()
    })
  })

  it('passes fulfillment value returned from callback', function () {
    return fsPromise.readdir(__dirname)
      .then(function (file) {
        expect(file).to.be.ok
        expect(file).to.be.an('array')
      })
  })

  it('handles the error on the rejection handler', function () {
    return fsPromise.readdir('amnotdirkay')
      .catch(function (err) {
        expect(err).to.be.an.instanceOf(Error)
      })
  })

  it('does not convert an object to Promise', function (done) {
    function test () {
      return ThenCatch.promisifies(util.notNodebackObjMock)
          .then(function () {})
    }

    expect(test).to.throws(TypeError)

    done()
  })

  it('does not convert normal (not nodeback styled) function to return Promise', function (done) {
    function test () {
      return ThenCatch.promisifies(util.notNodebackFnMock)
          .then(function () {})
    }

    expect(test).to.throws(TypeError)

    done()
  })
})
