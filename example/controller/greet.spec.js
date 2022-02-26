/* global describe, it, beforeEach */
const app = require('../')
const axios = require('axios')
const assert = require('assert')

function isNumber (str) {
  return !/NaN/.test(str - 0)
}

describe('hooks', function () {
  var port
  beforeEach(async () => {
    port = await app.ready()
  })

  it('request /', async function () {
    const response = await axios.get(`http://localhost:${port}/`)
    assert.ok(response.data.message.indexOf('i am index') > 0)
    const serverTime = response.headers['server-time']
    assert.ok(isNumber(serverTime))
    assert.ok(serverTime > 0)
  })

  it('request /greet/car', async function () {
    const response = await axios.get(`http://localhost:${port}/greet/car`)
    assert.strictEqual(response.data, 'dumb is in the car')
  })

  it('request /getinjections', async function () {
    const response = await axios.get(`http://localhost:${port}/getinjections`)
    assert.strictEqual(response.data, 'dumb/good')
  })

  it('request /man', async function () {
    const response = await axios.get(`http://localhost:${port}/man`)
    assert.strictEqual(response.data, 'good')
  })
})
