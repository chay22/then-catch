'use strict'

function FakePromise (executor) {
  var p = new Promise(function (resolve, reject) {
    return executor(resolve, reject)
  })

  Object.setPrototypeOf(p, FakePromise.prototype)

  return p
}

Object.setPrototypeOf(FakePromise, Promise)
Object.setPrototypeOf(FakePromise.prototype, Promise.prototype)

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
