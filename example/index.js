const rekoa = require('../')
const path = require('path')

require('@babel/register')({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  presets: [
    require.resolve('@babel/preset-typescript')
  ],
  plugins: [
    require.resolve('@babel/plugin-transform-modules-commonjs')
  ]
})

var app = rekoa({
  isDevelopment: true,
  base: __dirname,
  port: 0,
  templateBase: path.join(__dirname, 'template'),
  serviceLowerCasify: true,
  path: {
    service: path.join(__dirname, 'service'),
    middleware: path.join(__dirname, 'middleware'),
    controller: path.join(__dirname, 'controller')
  },
  callback () {
    console.log(app.getServer().address().port)
  }
})

app.start()

module.exports = app
