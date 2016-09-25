'use strict'

var chai = require('chai')
var sinon = require('sinon')
var ThenCatch = require('..')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('sequence()', function () {
  var sandbox, nodeEnv

  beforeEach(function () {
    nodeEnv = { env: process.env.NODE_ENV }
    sandbox = sinon.sandbox.create()
    sandbox.stub(console, 'info')
    sandbox.stub(console, 'error')
    sandbox.stub(console, 'dir')
    sandbox.stub(console, 'warn')
  })

  afterEach(function () {
    process.env.NODE_ENV = nodeEnv.env
    sandbox.restore()
  })

  it('returns an array of fulfillment', function () {
    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function () {
      return ThenCatch.resolve(43)
    }

    var c = function () {
      return ThenCatch.resolve(44)
    }

    return ThenCatch.sequence([a, b, c])
      .then(function (results) {
        expect(results).to.be.an('array')
        expect(results[0]).to.equal(42)
        expect(results[1]).to.equal(43)
        expect(results[2]).to.equal(44)
      })
  })

  it('breaks the chain if rejection found in the middle of the chain', function () {
    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function () {
      console.info('this will be called')
      return ThenCatch.resolve(43)
    }

    var c = function () {
      return ThenCatch.reject(44)
    }

    var d = function () {
      console.info('this will not be called')
      return ThenCatch.resolve(45)
    }

    return ThenCatch.sequence([a, b, c, d])
      .catch(function (err) {
        expect(err).to.equal(44)
      })
      .then(function () {
        expect(console.info).to.not.be.calledTwice
        expect(console.info).to.be.calledWith('this will be called')
      })
  })

  it('accepts another values inside array beside a function', function () {
    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function () {
      return ThenCatch.resolve(43)
    }

    var c = 44

    return ThenCatch.sequence([a, b, c])
      .then(function (results) {
        expect(results).to.deep.equal([42, 43, 44])
      })
  })

  it('accepts initial values inside array beside a function', function () {
    var a = 42

    var b = function () {
      return ThenCatch.resolve(43)
    }

    var c = ThenCatch.resolve(44)

    return ThenCatch.sequence([a, b, c])
      .then(function (results) {
        expect(results).to.deep.equal([42, 43, 44])
      })
  })

  it('warns if values inside array is a Promise, if NODE_ENV is set into "development"', function () {
    process.env.NODE_ENV = 'development'

    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function () {
      return ThenCatch.resolve(43)
    }

    var c = ThenCatch.resolve(44)

    return ThenCatch.sequence([a, b, c])
      .then(function () {
        expect(console.warn).to.be.called
      })
  })

  it('warns if values inside array is a Promise, if NODE_ENV is set into "production"', function () {
    process.env.NODE_ENV = 'production'

    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function () {
      return ThenCatch.resolve(43)
    }

    var c = ThenCatch.resolve(44)

    return ThenCatch.sequence([a, b, c])
      .then(function () {
        expect(console.warn).to.not.be.called
      })
  })

  it('resolves both fulfillment and rejection if "noReject" param sets true', function () {
    process.env.NODE_ENV = 'production'

    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function () {
      return ThenCatch.reject(43)
    }

    var c = function () {
      return ThenCatch.resolve(44)
    }

    return ThenCatch.sequence([a, b, c], true)
      .then(function (results) {
        expect(results).to.deep.equal([42, 43, 44])
      })
  })

  it('passes resolved value returned by chain before it if values inside array is a function', function () {
    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function (before) {
      console.info(before)
      return ThenCatch.resolve(43)
    }

    var c = function (before) {
      console.error(before)
      return ThenCatch.resolve(44)
    }

    return ThenCatch.sequence([a, b, c])
      .then(function (results) {
        expect(results).to.deep.equal([42, 43, 44])
        expect(console.info).to.be.calledWith(42)
        expect(console.error).to.be.calledWith(43)
      })
  })

  it('passes resolved value returned by chain before it and returned value from initial chain if values inside array is a function', function () {
    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function (before, initial) {
      console.info(before)
      console.error(initial)
      return ThenCatch.resolve(43)
    }

    var c = function (before, initial) {
      console.dir(initial)
      return ThenCatch.resolve(44)
    }

    return ThenCatch.sequence([a, b, c])
      .then(function (results) {
        expect(results).to.deep.equal([42, 43, 44])
        expect(console.info).to.be.calledWith(42)
        expect(console.error).to.be.calledWith(42)
        expect(console.dir).to.be.calledWith(42)
      })
  })
})
