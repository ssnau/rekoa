var path = require('path');
var   fs = require('fs');
var cache = {};
module.exports = function (context) {
  var config = context.config;
  return {
    render: function _render(data, tpl) {
      var p = path.join(config.templateBase, tpl);
      if (config.isDebug) cache = {};
      var template;
      if (cache[p]) {
        template = cache[p] || fs.readFileSync(p, 'utf8');
        cache[p] = template;
      }
      this.body = 'xxx' + handlebars.compile(template)(data);
    },
    json(data) {
      context.type = 'application/json';
      context.body = JSON.stringify(data, null, 2);
    }
  };
};
