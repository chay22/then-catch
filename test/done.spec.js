/* eslint func-call-spacing: 0, no-unexpected-multiline: 0 */

'use strict'

var chai = require('chai')
var sinon = require('sinon')
var ThenCatch = require('..')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('#done()', function () {
  var sandbox, ultimateNumber

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('passes fulfillment value into first parameter', function () {
    ThenCatch.resolve(42)
      .done(function (results) {
        ultimateNumber = results
      })

    return ThenCatch.resolve()
      .then(function () {
        expect(ultimateNumber).to.equal(42)
      })
  })

  it('passes rejection value into second parameter', function () {
    ThenCatch.reject(42)
      .done(null, function (results) {
        ultimateNumber = results
      })

    return ThenCatch.resolve()
      .then(function () {
        expect(ultimateNumber).to.equal(42)
      })
  })

  it('catches and outputs the error automatically with console#error()', function (done) {
    sandbox.stub(console, 'error')

    (function test () {
      ThenCatch.reject(42).done()
      done()
    }())

    expect(console.error).to.be.called
  })

  it('catches and outputs the error stack of any Error instances automatically with console#error()', function (done) {
    sandbox.stub(console, 'error')

    (function test () {
      ThenCatch.reject(new TypeError('42 is not 43.')).done()
      done()
    }())

    expect(console.error).to.be.called
  })

  it('catches and outputs the error thrown in fulfillment handler', function (done) {
    sandbox.stub(console, 'error')

    (function test () {
      ThenCatch.resolve().done(function () {
        throw new ReferenceError('Could not find where is 42 hid')
      })
      done()
    }())

    expect(console.error).to.be.called
  })

  it('catches and outputs the error thrown inside rejection handler', function (done) {
    sandbox.stub(console, 'error')

    (function test () {
      ThenCatch.resolve().done(null, function () {
        throw new SyntaxError('Unknow number 423')
      })
      done()
    }())

    expect(console.error).to.be.called
  })

  it('becomes/returns as undefined', function (done) {
    var test = ThenCatch.resolve(42)
      .done(function () {}, function () {})

    expect(test).to.be.undefined

    done()
  })

  it('throws an error if it chained with another Promise method', function () {
    return ThenCatch.resolve()
      .then(function () {
        return ThenCatch.resolve()
          .done()
          .then(function () {})
      })
      .catch(function (err) {
        expect(err).to.be.an.instanceOf(TypeError)
        expect(err.message).to.have.string('Cannot read property')
      })
  })
})
