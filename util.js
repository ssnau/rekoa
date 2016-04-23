var fs = require('fs');
var path = require('path');

module.exports = {
  getFilesFromDir: function readDir(dir) {
    return fs
      .readdirSync(dir)
      .reduce(function (acc, file) {
        var files = [path.join(dir, file)];
        if (fs.statSync(files[0]).isDirectory()) {
          files = readDir(absfile);
        }
        return acc.concat(files);
    }, []);
  },
  checkSyntax: () => true,
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
  predefinedSort: function (array, order) {
    return order
      .filter(function(x) { return array.indexOf(x) > -1 })
      .concat(
      array.filter(function (x) { return order.indexOf(x) === -1 })
    );
  },
  watch: function (p, callback) {
    var fs = require('fs');
    var watcher = fs.watch(p, { persistent: true, recursive: true }, function (evt, filename) {
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
