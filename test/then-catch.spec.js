'use strict'

var expect = require('chai').expect
var fnMock = require('./util').fnMock

describe('ThenCatch', function () {
  var ThenCatch

  afterEach(function () {
    ThenCatch = undefined
  })

  it('is subclass of native Promise', function (done) {
    ThenCatch = require('..')

    expect(ThenCatch.resolve()).to.be.an.instanceOf(Promise)
    expect(new ThenCatch(fnMock)).to.be.an.instanceOf(Promise)

    done()
  })
})
