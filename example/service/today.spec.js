/* global describe, it, beforeEach */
const app = require('../')
const axios = require('axios')
const assert = require('assert')

describe('today', function () {
  let port
  beforeEach(async () => {
    port = await app.ready()
    global.__REKOA_TEST_FN = function () { return 0 }
  })

  async function run (fn) {
    global.__REKOA_TEST_FN = fn
    await axios.get(`http://localhost:${port}/REKOA_TEST`, { proxy: false })
  }

  it('call today hi', async function () {
    await run(async (today) => {
      assert.strictEqual(today.hi(), 'good')
    })
  })

  it('call today car', async function () {
    await run(async (today) => {
      assert.strictEqual(today.carStatus(), 'dumb is in the car')
    })
  })

  it('call today car with Today class', async function () {
    await run(async (context) => {
      const Today = require('./today').default
      const today = await context.getInjection(Today)
      assert.strictEqual(today.carStatus(), 'dumb is in the car')
      assert.strictEqual(today.car2Status(), 'dumb is in the car')
      assert.strictEqual(today.car, today.car2)
    })
  })

  it('call today car with Today class with getInjection#map', async function () {
    await run(async (context) => {
      const Today = require('./today').default
      const Response = require('./response')
      const { today, response } = await context.getInjection({ today: Today, response: Response })
      assert.ok(response.render)
      assert.strictEqual(today.carStatus(), 'dumb is in the car')
      assert.strictEqual(today.car2Status(), 'dumb is in the car')
      assert.strictEqual(today.car, today.car2)
    })
  })
})
