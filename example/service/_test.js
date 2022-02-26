// this should not load, only for local test
const app = require('../')
const axios = require('axios');

(async function () {
  const port = await app.ready()
  const response = await axios.get('http://localhost:' + port)
  console.log(response.data)
})().then(x => {
  console.log('done')
}, e => {
  console.log(e)
})
