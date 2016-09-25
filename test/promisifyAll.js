var chai = require('chai')
var sinon = require('sinon')
var ThenCatch = require('../index.js')
var fs = require('fs')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('#promisifyAll()', function () {
  var fsPromise = ThenCatch.promisifyAll(fs)


  it('converts all nodeback-styled function to return Promise', function (done) {
    expect(fsPromise.readdir(__dirname)).to.be.an.instanceOf(Promise)
    expect(fsPromise.readFile(__filename)).to.be.an.instanceOf(Promise)

    done()
  })

  it('still passes the returned value into callback if the callback function specified', function (done) {
    fsPromise.readdir(__dirname, function (err, dir) {
      expect(dir).to.be.an('array')
      done()
    })
  })

  it('passes fulfillment value returned from callback', function () {
    return fsPromise.readdir(__dirname)
      .then(function (file) {
        expect(file).to.be.ok
        expect(file).to.be.an('array')
      })
  })

  it('handles the error on the rejection handler', function () {
    return fsPromise.readdir('amnotdirkay')
      .catch(function (err) {
        expect(err).to.be.an.instanceOf(Error)
      })
  })
})

