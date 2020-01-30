var fs = require('fs')
var path = require('path')
var readdir = require('xkit/fs/readdir')

module.exports = {
  getFilesFromDir: function readDir (dir) {
    var files = readdir(dir)
    return files.filter(x => {
      if (x.indexOf('/_') > -1) return false
      return true
    })
  },
  checkSyntax: () => true,
  safe: function (fn) {
    try {
      return fn()
    } catch (e) {

    }
  },
  filename: function (p) {
    return p.replace(/\.[^/.]+$/, '').replace(/^.*\//, '')
  },
  assignProperty (obj, name, value) {
    try {
      Object.defineProperty(obj, name, {
        value: value,
        enumerable: false,
        configurable: true
      })
    } catch (e) {
    // do nothing
    }
  },
  predefinedSort: function (array, order) {
    return order
      .filter(function (x) { return array.indexOf(x) > -1 })
      .concat(
        array.filter(function (x) { return order.indexOf(x) === -1 })
      )
  },
  watch: function (p, callback) {
    if (!fs.existsSync(p)) return
    fs.watch(p, { persistent: true, recursive: true }, function (evt, filename) {
      var f = path.join(p, filename)
      if (/\/_/.test(f)) return // ignore files start with _
      try {
        callback.apply(this, [].concat(f))
      } catch (e) {
        console.log('watcher got error', e.stack)
      }
    })
  }
}
