var path = require('path');
var   fs = require('fs');
var handlebars = require('handlebars');

var cache = {};
module.exports = function (context) {
  var config = context.config;
  return {
    render: function _render(data, tpl) {
      var p = path.join(config.templateBase, tpl);
      if (config.isDebug) cache = {};
      var template = cache[p];
      if (!template) {
        var tsrc = cache[p] || fs.readFileSync(p, 'utf8');
        template = handlebars.compile(tsrc);
        cache[p] = template;
      }
      context.body = template(data);
    },
    json(data) {
      context.type = 'application/json';
      context.body = JSON.stringify(data, null, 2);
    }
  };
};
