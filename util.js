var fs = require('fs')
var path = require('path')
var readdir = require('xkit/fs/readdir')
var os = require('os');
const isLinux = /linux/.test(os.platform())
const chokidar = require('chokidar');

const watchCallbackMap = {};
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
    watchCallbackMap[p] = callback;
    function handle(f) {
      if (/\/_/.test(f)) return // ignore files start with _
      try {
        callback.apply(this, [].concat(f))
      } catch (e) {
        console.log('watcher got error', e.stack)
      }
    }
    if (isLinux) {
      chokidar.watch(p, {persistent: true, usePolling: true}).on('all', (event, f) => {
        // `add` and `addDir` are misleading. They are emitted every time when the app starts.
        // so I have to disable them. I won't bring any problem since any file newly added will
        // be changed in follow-up operations.
        if (/add/.test(event)) return; 
        handle(f);
      });
      return;
    }

    fs.watch(p, { persistent: true, recursive: true }, function (evt, filename) {
      handle(path.join(p, filename));
    });
  },
  trigger: function (absfile) {
    Object.keys(watchCallbackMap).forEach(function (basePath) {
      if (absfile.indexOf(basePath) === 0) watchCallbackMap[basePath](absfile);
    });
  }
}
