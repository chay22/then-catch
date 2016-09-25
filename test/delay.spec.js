'use strict'

var expect = require('chai').expect
var ThenCatch = require('../index.js')
var util = require('./util/util')
var start = util.start
var end = util.end

describe('#delay()', function () {
  it('sleeps next fulfillment execution for 1000ms by default', function () {
    return ThenCatch.resolve(start())
      .delay()
      .then(function (results) {
        expect(end(results)).to.be.within(950, 1100)
      })
  })

  it('sleeps next fulfillment execution for given time in ms', function () {
    return ThenCatch.resolve(start())
      .delay(300)
      .then(function (results) {
        expect(end(results)).to.be.within(250, 350)
      })
  })

  it('sleeps next rejection execution for given time in ms', function () {
    return ThenCatch.reject(start())
      .delay(300, true)
      .catch(function (results) {
        expect(end(results)).to.be.within(250, 350)
      })
  })

  it('sleeps next rejection execution for 1000ms by default if no duration time given as number and rejection sets true', function () {
    return ThenCatch.reject(start())
      .delay(null, true)
      .catch(function (results) {
        expect(end(results)).to.be.within(950, 1100)
      })
  })

  it('can be chained, latter execution will wait for defined delay time before it', function () {
    var startTime = start()

    return ThenCatch.resolve(startTime)
      .delay(300)
      .then(function (results) {
        expect(end(results)).to.be.within(250, 350)

        return ThenCatch.reject(results)
      })
      .delay(300, true)
      .catch(function (results) {
        expect(end(results)).to.be.within(550, 650)
      })
  })
})
