'use strict'

/* istanbul ignore next */
var extend = Object.assign || require('util')._extend,
    hasCallbackRE = /.*function.+\(.*,\s*_?(callback|cb)_?\)/

/**
 * Constructor.
 * @param {Function} fn Promise executor.
 */
function ThenCatch (fn) {
  var p = new Promise(function (resolve, reject) {
    return fn(resolve, reject)
  })

  Object.setPrototypeOf(p, ThenCatch.prototype)

  return p
}

/**
 * Inherits
 */
Object.setPrototypeOf(ThenCatch, Promise)
Object.setPrototypeOf(ThenCatch.prototype, Promise.prototype)

/**
 * Break Promise chain.
 * @param  {Function} onResolve
 * @param  {Function} onReject
 */
ThenCatch.prototype.done = function ThenCatch$done (onResolve, onReject) {
  this.then(onResolve, onReject)
    .catch(function (err) {
      console.error(err.stack || err)
    })
}

/**
 * Resolve either fulfillment or rejection.
 * @param  {Function}  fn
 * @return {ThenCatch}
 */
ThenCatch.prototype.finally = function ThenCatch$finally (fn) {
  return this.catch(function (results) {
    return results
  })
  .then(fn)
}

/**
 * Delay next fulfillment or rejection. If 'onReject'
 * sets to true, the delayment will apply to next
 * rejection.
 * @param  {Number}   duration Time to delay in ms.
 * @param  {Boolean}  onReject
 * @return {ThenCatch}
 */
ThenCatch.prototype.sleep = function ThenCatch$sleep (duration, onReject) {
  if (typeof duration !== 'number') {
    duration = 1000
  }

  return this[onReject ? 'catch' : 'then'](function (results) {
    return new ThenCatch(function (resolve, reject) {
      setTimeout(function () {
        onReject ? reject(results) : resolve(results)
      }, duration)
    })
  })
}

/**
 * Attempt to resolve each Promise in sequence, one
 * after another. If a value inside arr is a function,
 * it will be given a resolved results value before it
 * as first parameter and an initial resolved results
 * value as second parameter.
 * @param  {Array}    arr
 * @param  {Boolean}  noReject
 * @return {ThenCatch}
 */
ThenCatch.sequence = function ThenCatch$sequence (arr, noReject) {
  var promises = [],
      p = this.resolve(),
      initialValue

  $loop(arr, function (value, i) {
    p = p.then(function (results) {
      if (
        value instanceof Promise &&
        process.env.NODE_ENV !== 'production'
      ) {
        console.warn(
          '[ThenCatch#sequence] Warning: assigning Promise into ' +
          '#sequence argument array will execute the logic inside ' +
          'it without waiting one after another. Use #all instead.'
        )
      }

      if (typeof value === 'function') {
        value = value(results, initialValue)
      }

      // Store the results value of first iteration.
      if (i === 0) {
        if (value instanceof Promise) {
          value = value.then(function (v) {
            return (initialValue = v)
          })
        } else {
          initialValue = value
        }
      }

      return value
    })

    if (noReject) {
      p = p.finally(function (finalResults) {
        return finalResults
      })
    }

    promises.push(p)
  })

  return this.all(promises)
}

/**
 * Attempt to resolve a rejected Promise for given
 * times until it is resolved. If it still rejected
 * once maximum attempt time been hit, the results
 * value will be threw instead.
 * @param  {Function}  fn     This function must return a Promise.
 * @param  {Number}    max
 * @param  {Number}    delay
 * @return {ThenCatch}
 */
ThenCatch.retry = function ThenCatch$retry (fn, max, delay, _i) {
  max = max || 3
  _i = _i || 1
  delay = delay || 0

  return new ThenCatch(function (resolve) {
    resolve(fn(_i))
  })
  .sleep(delay, true)
  .then(function (results) {
    return results
  })
  .catch(function (err) {
    if (_i < max) {
      return ThenCatch.retry(fn, max, delay, _i + 1)
    }

    throw err
  })
}

/**
 * Convert a nodeback function to return a Promise.
 * @param  {Function}  fn
 * @return {ThenCatch}
 */
ThenCatch.promisify = function ThenCatch$Promisify (fn) {
  return function promisifiedFn () {
    var self = this,
        args = Array.prototype.slice.call(arguments)

    return new ThenCatch(function (resolve, reject) {
      function promisifyCallback (err) {
        if (err) {
          reject(err)
        } else {
          resolve.apply(
            self, Array.prototype.slice.call(arguments, 1)
          )
        }
      }

      args.push(promisifyCallback)
      fn.apply(self, args)
    })
  }
}

/**
 * Convert nodeback instance's function to return Promise.
 * @param  {Object} obj
 * @return {Object}
 */
ThenCatch.promisifies = function ThenCatch$promisifies (obj) {
  var instance = extend({}, obj),
      key, fn

  for (key in instance) {
    fn = instance[key]

    if (
      typeof fn === 'function' &&
      hasCallbackRE.test(fn.toString())
    ) {
      instance[key] = this.promisify(fn)
    }
  }

  return instance
}

function $loop (arr, fn) {
  var arrLen = arr.length, i

  for (i = 0; i < arrLen; i++) {
    fn(arr[i], i)
  }
}

module.exports = ThenCatch
