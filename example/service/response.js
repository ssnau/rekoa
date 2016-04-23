module.exports = function (context) {
  return {
    render(data, tpl) {
      return fsp.readFile(file, 'utf8').then(function(template) {
        return handlebars.compile(template)(data);
      });
    },
    json(data) {
      context.type = 'application/json';
      context.body = JSON.stringify(data, null, 2);
    }
  };
};
