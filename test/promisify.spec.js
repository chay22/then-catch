'use strict'

var chai = require('chai')
var sinon = require('sinon')
var fs = require('fs')
var ThenCatch = require('../index.js')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('#promisify()', function () {
  var sandbox, readdir, readFile

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    readdir = ThenCatch.promisify(fs.readdir)
    readFile = ThenCatch.promisify(fs.readFile)
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('converts asynchronous node-callback-styled function to return a Promise', function (done) {
    expect(readdir(__dirname)).to.be.an.instanceOf(Promise)
    expect(readdir(__dirname)).to.be.an.instanceOf(ThenCatch)

    done()
  })

  it('still passes the returned value into callback if the callback function specified', function (done) {
    readdir(__dirname, function (_, dir) {
      expect(dir).to.be.an('array')
      done()
    })
  })

  it('passes fulfillment value returned from callback', function () {
    return readFile(__filename)
      .then(function (file) {
        expect(file).to.be.ok
        expect(file).to.be.an.instanceOf(Buffer)
      })
  })

  it('handles the error on the rejection handler', function () {
    return readdir('amnotdirkay')
      .catch(function (err) {
        expect(err).to.be.an.instanceOf(Error)
      })
  })
})

