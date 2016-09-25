'use strict'

var expect = require('chai').expect
var util = require('./util')
var FakePromise = util.FakePromise
var fnMock = util.fnMock

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

  it('can be a subclass of given Promise', function (done) {
    ThenCatch = require('..').use(FakePromise)

    expect(ThenCatch.resolve()).to.be.an.instanceOf(FakePromise)
    expect(new ThenCatch(fnMock)).to.be.an.instanceOf(FakePromise)

    expect(ThenCatch.resolve()).to.be.an.instanceOf(Promise)
    expect(new ThenCatch(fnMock)).to.be.an.instanceOf(Promise)

    done()
  })
})
