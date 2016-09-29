'use strict'

var chai = require('chai')
var sinon = require('sinon')
var ThenCatch = require('..')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('while()', function () {
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    sandbox.stub(console, 'info')
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('loops a function for 5 times', function () {
    return ThenCatch.while(
      function (i) {
        return i < 4
      },
      function (v, i) {
        console.info('Aye')
        return i
      })
      .then(function (results) {
        expect(results).to.equal(4)
        expect(console.info).callCount(5)
      })
  })

  it('cancels next iteration and rejects the result value if the "doFn" throws', function () {
    return ThenCatch.while(
      function (i) {
        return i < 4
      },
      function (v, i) {
        if (i === 2) {
          throw 45
        }

        console.info('Aye')

        return 42 + v
      })
      .catch(function (err) {
        expect(err).to.equal(45)
        expect(console.info).to.be.calledTwice
      })
  })
})
