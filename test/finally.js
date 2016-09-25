var expect = require('chai').expect
var ThenCatch = require('../index.js')

describe('#finally()', function () {
  it('passes fulfillment value', function () {
    return ThenCatch.resolve(42)
      .finally(function (results) {
        expect(results).to.equal(42)
      })
  })

  it('passes rejection value', function () {
    return ThenCatch.reject(42)
      .finally(function (results) {
        expect(results).to.equal(42)
      })
  })

  it('passes a thrown value inside fulfillment', function () {
    return ThenCatch.resolve()
      .then(function () {
        throw 42
      })
      .finally(function (results) {
        expect(results).to.equal(42)
      })
  })

  it('passes a thrown value inside rejection', function () {
    return ThenCatch.reject()
      .catch(function () {
        throw 42
      })
      .finally(function (results) {
        expect(results).to.equal(42)
      })
  })

  it('passes a thrown any Error instance', function () {
    return ThenCatch.resolve()
      .then(function () {
        throw new TypeError('42 is not 43')
      })
      .finally(function (results) {
        expect(results).to.be.an.instanceOf(TypeError)
        expect(results.message).to.equal('42 is not 43')
      })
  })

})

