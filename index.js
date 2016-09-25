module.exports = ThenCatch$Factory()

module.exports.use = promiseLib => {
  return ThenCatch$Factory(promiseLib)
}

function ThenCatch$Factory (_Promise) {
  _Promise = _Promise || Promise

  const hasCallbackRE = /.*function.+\(.*,\s*_?(callback|cb)_?\)/

  return class ThenCatch extends _Promise {
    /**
     * Break Promise chain.
     * @param  {Function} onResolve
     * @param  {Function} onReject
     */
    done (onResolve, onReject) {
      this.then(onResolve, onReject)
        .catch(err => {
          console.error(err.stack || err)
        })
    }

    /**
     * Resolve either fulfillment or rejection.
     * @param  {Function}  fn
     * @return {ThenCatch}
     */
    finally (fn) {
      return this.catch(value => value).then(fn)
    }

    /**
     * Delay next fulfillment or rejection. If 'onReject'
     * sets to true, the delayment will apply to next
     * rejection.
     * @param  {Number}   duration Time to delay in ms.
     * @param  {Boolean}  onReject
     * @return {ThenCatch}
     */
    delay (duration, onReject) {
      if (typeof duration !== 'number') {
        duration = 1000
      }

      return this[onReject ? 'catch' : 'then'](value => {
        return new this.constructor((resolve, reject) => {
          setTimeout(() => onReject ? reject(value) : resolve(value), duration)
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
    static sequence (arr, noReject) {
      let initialValue
      let promises = []
      let p = this.resolve()

      for (let i = 0; i < arr.length; i++) {
        let fn = arr[i]

        p = p.then((value) => {
          if (
            fn instanceof Promise &&
            process.env.NODE_ENV !== 'production'
          ) {
            console.warn(
              '[ThenCatch#sequence] Warning: assigning Promise into ' +
              '#sequence argument array will execute the logic inside ' +
              'it without waiting one after another. Use #all instead.'
            )
          }

          if (typeof fn === 'function') {
            fn = fn(value, initialValue)
          }

          if (i === 0) {
            if (fn instanceof Promise) {
              fn = fn.then(v => (initialValue = v))
            } else {
              initialValue = fn
            }
          }

          return fn
        })

        if (noReject) {
          p = p.finally(value => value)
        }

        promises.push(p)
      }

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
    static retry (fn, max, delay, _i) {
      max = max || 3
      _i = _i || 1
      delay = delay || 0

      return fn(_i)
        .delay(delay, true)
        .then(value => value)
        .catch(err => {
          if (_i < max) {
            return this.retry(fn, max, delay, _i + 1)
          }

          throw err
        })
    }

    /**
     * Convert a nodeback function to return a Promise.
     * @param  {Function}  fn
     * @return {ThenCatch}
     */
    static promisify (fn) {
      return function promisifiedFn () {
        const self = this
        let args = Array.prototype.slice.call(arguments)

        return new ThenCatch((resolve, reject) => {
          const callback = function promisifyCallback (err) {
            if (err) {
              reject(err)
            } else {
              resolve.apply(
                self, Array.prototype.slice.call(arguments, 1)
              )
            }
          }

          args.push(callback)
          fn.apply(self, args)
        })
      }
    }

    /**
     * Convert nodeback instance's function to return Promise.
     * @param  {Object} obj
     * @return {Object}
     */
    static promisifyAll (obj) {
      const instance = Object.assign({}, obj)

      for (const key in instance) {
        const fn = instance[key]

        if (
          typeof fn === 'function' &&
          hasCallbackRE.test(fn.toString())
        ) {
          instance[key] = this.promisify(fn)
        }
      }

      return instance
    }
  }
}
