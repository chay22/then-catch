'use strict'

function FakePromise (executor) {
    var p = new Promise(function (resolve, reject) {
        return executor(resolve, reject)
    })

    p.__proto__ = FakePromise.prototype
    return p;
}

FakePromise.__proto__ = Promise
FakePromise.prototype.__proto__ = Promise.prototype

module.exports = {
  FakePromise: FakePromise,

  fnMock: function fnMock () {},

  notNodebackFnMock: function notNodebackFnMock () {},

  notNodebackObjMock: {},

  start: function start () {
    return new Date().getTime()
  },

  end: function end (time) {
    return new Date().getTime() - time
  }
}
