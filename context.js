module.exports = function (app) {

  function setup(files) {
    var context = {};
    files.forEach(function(x) {
      var extend = require(x);
      Object.keys(extend).forEach(function(key) {
        if (context[key]) throw new Error(key + ' is overrided');
        context[key] = extend[key];
      });
    });

    Object.keys(context).forEach(function(k) { app.context[k] = context[k]});
  }

  return {
    setup: setup,
    filter: /js$/,
    fullReload: true,
    name: 'context'
  };
    
};
