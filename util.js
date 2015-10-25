var glob = require('glob');
var fs = require('fs');
var path = require('path');

module.exports = {
  getFilesFromDir: function (dir) {
    return glob.sync(dir + "/*").filter(function(f) {
      var rfp = path.relative(dir, f);

      if(/\/_/.test(rfp)) return false;

      return true;
    });
  },
  safe: function (fn) {
    try {
      return fn();
    } catch (e) {
      return;
    }
  },
  filename: function (p) {
    return p.replace(/\.[^/.]+$/, "").replace(/^.*\//, '');
  },
  checkSyntax: function (file) {
    try {
      var babel = require('babel');
      babel.transform(fs.readFileSync(file, 'utf-8'), {stage: 0});
      return false;
    } catch (e) {
      return e;
    }
  },
  predefinedSort: function (array, order) {
    return order
      .filter(function(x) { return array.indexOf(x) > -1 })
      .concat(
      array.filter(function (x) { return order.indexOf(x) === -1 })
    );
  },
  watch: function (p, callback) {
    var fsevents = require('fsevents');
    var watcher = fsevents(p);
    watcher.start(); // To start observation
    watcher.on('change', function(_p) {
      var rfp = path.relative(p, _p);

      if(/\/_/.test(rfp)) return; // ignore files start with _

      try {
        callback.apply(this, [].slice.call(arguments));
      } catch (e) {
        console.log('watcher got error', e.stack);
      }
    });
  }
};
