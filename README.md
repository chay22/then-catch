# [WIP]

<h1 align="center"><a id="user-content-thencatch" class="anchor" href="#thencatch" aria-hidden="true"><svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg></a>ThenCatch</h1>

<p align="center">Pretty small node Promise helper built with micro-optimization in mind.</p>

<p align="center">
  <a href="https://circleci.com/gh/chay22/then-catch"><img src="https://img.shields.io/circleci/project/chay22/then-catch.svg" alt="Build Status"></a>
  <a href="https://coveralls.io/github/chay22/then-catch?branch=master"><img src="https://img.shields.io/coveralls/chay22/then-catch/master.svg" alt="Coverage Status"></a>
  <a href="https://codeclimate.com/github/chay22/then-catch"><img src="https://codeclimate.com/github/chay22/then-catch/badges/gpa.svg" alt="Code Quality"></a>
  <a href="https://www.npmjs.com/package/then-catch"><img src="https://img.shields.io/npm/v/then-catch.svg" alt="Version"></a>
  <a href="https://github.com/chay22/then-catch/blob/master/LICENSE"><img src="https://img.shields.io/github/license/chay22/then-catch.svg" alt="License"></a>
</p>

## Intro
While there are bunch of Promise helpers out there, one may feel things are not suite the case, or it's kind of bloated, or place any reason here. Rather than reinventing the wheel, although, this library comes with several Promise helper methods which already offered by any Promise libraries on this planet, some of those methods are actually have a slightly different behavior. Other than that, this library also built with micro-optimization in mind.

## Installation
```shell
npm i -S then-catch
```

## Usage
ThenCatch extends native Promise by default.

```javascript
const tc = require('then-catch')

tc.resolve(42)
  .then(results => results)
  .catch(err => {
    console.error('U WOT M8', err.stack)
  })
```

If you already using a Promise library such as the mighty [Bluebird](https://github.com/petkaantonov/bluebird), assign it to `use` method while `require`ing.

```javascript
const Bluebird = require('bluebird')
const tc = require('then-catch').use(Bluebird)

tc.sequence([someFn, anotherFn, yetAnotherFn])
  .each(inspection => {
    if (inspection.isFulfilled()) {
        console.log('I am fulfilled', inspection.value());
    } else {
        console.error('am done with you', inspection.reason());
    }
  })
```
> NOTE: Some methods has same name with any existing Promise libraries, thus will be overriden and will exactly has different behaviour than expected.

## Test
Find more examples or run some test, checkout the [test](https://github.com/chay22/then-catch/tree/master/test) directory or run,
```shell
npm test
```

## License
[The MIT License](https://github.com/chay22/then-catch/blob/master/LICENSE)
