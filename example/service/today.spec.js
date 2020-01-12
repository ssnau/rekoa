/* global describe, it, beforeEach */
const app = require('../')
const axios = require('axios')
const assert = require('assert')

describe('today', function () {
  var port
  beforeEach(async () => {
    port = await app.ready()
    global.__REKOA_TEST_FN = function () { return 0 }
  })

  async function run (fn) {
    global.__REKOA_TEST_FN = fn
    await axios.get(`http://localhost:${port}/REKOA_TEST`)
  }

  it('call today hi', async function () {
    await run(async (today) => {
      assert.strictEqual(today.hi(), 'good')
    })
  })
})
