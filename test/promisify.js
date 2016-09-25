var chai = require('chai')
var sinon = require('sinon')
var ThenCatch = require('../index.js')
var fs = require('fs')
var expect = chai.expect

chai.use(require('sinon-chai'))

describe('#promisify()', function () {
  var sandbox

  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('converts asynchronous node-callback-styled function to return a Promise', function (done) {
    var readdir = ThenCatch.promisify(fs.readdir)

    expect(readdir(__dirname)).to.be.an.instanceOf(Promise)
    expect(readdir(__dirname)).to.be.an.instanceOf(ThenCatch)

    done()
  })

  it('still passes the returned value into callback if the callback function specified', function (done) {
    var readdir = ThenCatch.promisify(fs.readdir)
    
    readdir(__dirname, function (err, dir) {
      expect(dir).to.be.an('array')
      done()
    })
  })

  it('passes fulfillment value returned from callback', function () {
    var readFile = ThenCatch.promisify(fs.readFile)

    return readFile(__filename)
      .then(function (file) {
        expect(file).to.be.ok
        expect(file).to.be.an.instanceOf(Buffer)
      })
  })

  it('handles the error on the rejection handler', function () {
    var readdir = ThenCatch.promisify(fs.readdir)

    return readdir('amnotdirkay')
      .catch(function (err) {
        expect(err).to.be.an.instanceOf(Error)
      })
  })
})

