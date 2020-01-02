/* global describe, it, beforeEach */
const app = require('../')
const axios = require('axios')
const assert = require('assert')

describe('hooks', function () {
  var port
  beforeEach(async () => {
    port = await app.ready()
  })

  it('request /', async function () {
    const response = await axios.get(`http://localhost:${port}/`)
    assert.ok(response.data.message.indexOf('i am index') > 0)
  })

  it('request /greet/car', async function () {
    const response = await axios.get(`http://localhost:${port}/greet/car`)
    assert.strictEqual(response.data, 'dumb is in the car')
  })
})
