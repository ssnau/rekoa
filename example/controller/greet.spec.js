/* global describe, it, beforeEach */
const app = require('../')
const axios = require('axios')
const assert = require('assert')

function isNumber (str) {
  return !/NaN/.test(str - 0)
}

describe('hooks', function () {
  let port
  beforeEach(async () => {
    port = await app.ready()
  })

  function httpGet (path) {
    return axios.get(`http://127.0.0.1:${port}${path}`, { proxy: false })
  }

  it('request /', async function () {
    const response = await httpGet('/')
    assert.ok(response.data.message.indexOf('i am index') > 0)
    const serverTime = response.headers['server-time']
    assert.ok(isNumber(serverTime))
    assert.ok(serverTime > 0)
  })

  it('request /greet/car', async function () {
    const response = await httpGet('/greet/car')
    assert.strictEqual(response.data, 'dumb is in the car')
  })

  it('request /getinjections', async function () {
    const response = await httpGet('/getinjections')
    assert.strictEqual(response.data, 'dumb/good')
  })

  it('request /man', async function () {
    const response = await httpGet('/man')
    assert.strictEqual(response.data, 'good')
  })
})
