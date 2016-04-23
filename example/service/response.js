var cache = {};
module.exports = function (context, app) {
  return {
    render: function _render(data, tpl) {
      var p = path.join(context.templateBase, tpl);
      if (app.config.isDebug) cache = {};
      var template;
      if (cache[p]) {
        template = cache[p] || fs.readFileSync(p, 'utf8');
        cache[p] = template;
      }
      return handlebars.compile(template)(data);
    },
    json(data) {
      context.type = 'application/json';
      context.body = JSON.stringify(data, null, 2);
    }
  };
};
