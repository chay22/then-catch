var chai = require('chai')
var ThenCatch = require('../index.js')
var sinon = require('sinon')
var expect = chai.expect

chai.use(require('sinon-chai'))

function start () {
  return new Date().getTime()
}

function end (time) {
  return new Date().getTime() - time
}

describe('retry()', function () {
  this.timeout(10000)

  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
    sandbox.stub(console, 'info')
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('retries a rejection for 3 times without delay by default', function () {
    var startTime = start()

    return ThenCatch.retry(function (attempt) {
      console.info('Ahoy ahoy!')

      return ThenCatch.reject(42 + attempt)
    })
    .catch(function (results) {
      expect(results).to.equal(45)
      expect(console.info).to.be.calledThrice
      expect(end(startTime)).to.be.below(50)
    })
  })

  it('retries a rejection with given delay time in ms for 3 times by default', function () {
    var startTime = start()

    return ThenCatch.retry(function (attempt) {
      console.info('Ahoy ahoy!')

      return ThenCatch.reject(42 + attempt)
    }, null, 200)
    .catch(function (results) {
      expect(results).to.equal(45)
      expect(console.info).to.be.calledThrice
      expect(end(startTime)).to.be.below(700)
    })
  })

  it('retries a rejection with given delay time in ms and for given times', function () {
    var startTime = start()

    return ThenCatch.retry(function (attempt) {
      console.info('Ahoy ahoy!')

      return ThenCatch.reject(42 + attempt)
    }, 2, 100)
    .catch(function (results) {
      expect(results).to.equal(44)
      expect(console.info).to.be.calledTwice
      expect(end(startTime)).to.be.below(400)
    })
  })

  it('returns fulfillment value if there is no more rejection', function () {
    var startTime = start()

    return ThenCatch.retry(function (attempt) {
      if (attempt > 2) {
        return ThenCatch.resolve('woohoo')
      }

      return ThenCatch.reject(42 + attempt)
    }, 4, 150)
    .then(function (results) {
      expect(results).to.equal('woohoo')
      expect(end(startTime)).to.be.below(350) // should be 150 * 2
    })
  })
})

