var chai = require('chai')
var sinon = require('sinon')
var ThenCatch = require('../index.js')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('#sequence()', function () {
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    sandbox.stub(console, 'info')
  })

  afterEach(function () {
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

  it('warns if values inside array is a Promise', function () {
    sandbox.stub(console, 'warn')

    var a = function () {
      return ThenCatch.resolve(42)
    }

    var b = function () {
      return ThenCatch.resolve(43)
    }

    var c = ThenCatch.resolve(44)

    var sequence = function () {
      return ThenCatch.sequence([a, b, c])
    }

    return ThenCatch.sequence([a, b, c])
      .then(function () {
        expect(console.warn).to.be.called
      })
  })
})

