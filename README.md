# [WIP]

<h1 align="center"><a id="user-content-thencatch" class="anchor" href="#thencatch" aria-hidden="true"><svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>ThenCatch</h1>

<p align="center">Small and fast Promise helper for node.</p>

<p align="center">
  <a href="https://circleci.com/gh/chay22/then-catch"><img src="https://img.shields.io/circleci/project/chay22/then-catch.svg" alt="Build Status"></a>
  <a href="https://coveralls.io/github/chay22/then-catch?branch=master"><img src="https://img.shields.io/coveralls/chay22/then-catch/master.svg" alt="Coverage Status"></a>
  <a href="https://codeclimate.com/github/chay22/then-catch"><img src="https://codeclimate.com/github/chay22/then-catch/badges/gpa.svg" alt="Code Quality"></a>
  <a href="https://www.npmjs.com/package/then-catch"><img src="https://img.shields.io/npm/v/then-catch.svg" alt="Version"></a>
  <a href="https://github.com/chay22/then-catch/blob/master/LICENSE"><img src="https://img.shields.io/github/license/chay22/then-catch.svg" alt="License"></a>
</p>

## Intro
ThenCatch inherits native Promise class to offers quite common implemented method by any Promise libraries out there in chain. Rather than reinventing the wheel, some methods are actually have slightly different behaviour than other Promise helpers on this planet. Furthermore, it's fast, faster!

## Installation
```shell
npm i -S then-catch
```

## Usage
Just like how you usually use Promise.

```javascript
const ThenCatch = require('then-catch')

ThenCatch.resolve(42)
  .then(results => {
    console.log('the answer to life the universe and everything', results)
  })
  .catch(err => {
    console.error('U WOT M8', err.stack)
  })
```

## API
### ::sequence
Resolve task one after another.

<pre><code>::<strong>sequence</strong>(<i>Array</i> <strong>tasks</strong>, <i>Boolean</i> <strong>noReject</strong>)</code></pre>

#### Parameters
`tasks` - An array which may contain any values. If the `tasks` array contains a function, first parameter of the function will be a returned value of previous task while the second parameter will be a returned value of initial task. Just to make sure to not fill the array with Promises, since Promise happens to run any logic you want it to be resolved just before you place it in this method which ruins the order execution. If that's what you're expect, use `Promise::all` instead, or if it doesn't, wrap any Promises in a function.

`noReject` - If set to true, any rejections caught will be resolved along with other fulfilled results. Default to false.

#### Returns
Appear almost the same as `Promise::all`, this method will reject upon the first error, or resolve upon completion of all tasks and return the results in an array. If a rejection caught in the middle of the task execution, rest tasks appear after the rejected task will be ignored / won't be called.

#### Example
```javascript

function aTask (prevValue) {
  return (prevValue || 0) + 1
}

function anotherTask (prevValue, initial) {
  return prevValue + initial
}

function ordinaryTask (prevValue, initial) {
  return ThenCatch.resolve(prevValue + initial)
}

function badTask () {
  throw 22
}

ThenCatch.sequence([42, aTask, anotherTask, ordinaryTask])
  .then(results => console.log(results)) // output: [42, 43, 85, 127]

ThenCatch.sequence([aTask, anotherTask, badTask, ordinaryTask])
  .then(results => console.log(results)) // this won't be called...
  .catch(err => console.error(err)) // output: 22

ThenCatch.sequence([aTask, anotherTask, ordinaryTask, badTask], true)
  .then(results => console.log(results)) // output: [1, 2, 3, 22]
```

---

### ::retry
Attempt to resolve a rejected Promise for given times until it is resolved. If it still rejected once maximum attempt time been hit, the results value will be threw instead.

<pre><code>::<strong>retry</strong>(<i>Function</i> <strong>fn</strong>, <i>Number</i> <strong>max</strong>, <i>Number</i> <strong>delay</strong>)</code></pre>

#### Parameters
`fn` - Function to call. This function may return any value including Promise. A parameter, `attempt` will be passed to this function as a counter of times this function been called, starting from 1.

`max` - Maximum retry attempt. Default to 3.

`delay` - Delay time between each attempt in ms. Default to 0.

#### Returns
A Promise with resolved results value returned from `fn`.

#### Example
```javascript
ThenCatch.retry(attempt => {
  if (attempt < 2) {
    return ThenCatch.reject()
  )
  
  return ThenCatch.resolve(attempt)
})
.then(results => console.log(results)) // output: 3

ThenCatch.retry(attempt => {
  throw attempt
})
.then(results => console.log(results)) // this won't be called...
.catch(err => console.error(err)) // output: 3
```

---

### ::while
Call a function repeatedly and stop while a function condition returns falsy. This method acts like `do-while` approach.

<pre><code>::<strong>while</strong>(<i>Function</i> <strong>whileFn</strong>, <i>Function</i> <strong>doFn</strong>)</code></pre>

#### Parameters
`whileFn` - A function which its returned value used to indicates whether the `doFn` function should stop from being called. A parameter `i` passed as a counter of times the `doFn` function getting called, starting from 0.

`doFn` - A function which will be called repeatedly. This function may return any value including Promise. Value returned from previous call will be passed as first parameter and the second parameter will contain a counter, like `whileFn`.

#### Returns
A Promise with resolved results value returned by `doFn`. If `doFn` results a rejection, the loop however will stop.

#### Example
```javascript
ThenCatch.while(
  i => i < 5,
  (prevValue, i) => {
    return prevValue + i
  }
)
.then(results => console.log(results)) // output: NaN
                                       // (since prevValue from initial call is undefined)

ThenCatch.while(
  i => i < 5,
  (prevValue, i) => {
    if (i === 2) {
      ThenCatch.reject(42)
    }
    
    console.log('called') // called twice
  }
)
.catch(err => console.log(err)) // output: 42
```

---

### ::promisify
Convert nodeback styled function to return a Promise.

<pre><code>::<strong>promisify</strong>(<i>Function</i> <strong>fn</strong>)</code></pre>

#### Parameters
`fn` - Function to convert.

#### Returns
A function which will return a Promise.

#### Example
```javascript
function nodeback (yesNo, callback) {
  const logic = whatFn(yesNo ? 'mkay' : 'hurr durr')

  if (logic) {
    callback(null, logic)
  } else {
    callback(new MindBlowingError('hey!'))
  }
}

const nodebackAsync = ThenCatch.promisify(nodeback)

nodebackAsync(true)
  .then(results => console.log(results))
  .catch(err => console.error(err))
// output? Use your imagination.
```

## Test
Find more examples or run some test, checkout the [test](https://github.com/chay22/then-catch/tree/master/test) directory or run,
```shell
npm test
```

## License
[The MIT License](https://github.com/chay22/then-catch/blob/master/LICENSE)
