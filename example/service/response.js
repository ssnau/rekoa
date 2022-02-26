const path = require('path')
const fs = require('fs')
const handlebars = require('handlebars')

let cache = {}
module.exports = function (context) {
  const config = context.config
  return {
    render: function _render (data, tpl) {
      const p = path.join(config.templateBase, tpl)
      if (config.isDebug) cache = {}
      let template = cache[p]
      if (!template) {
        const tsrc = cache[p] || fs.readFileSync(p, 'utf8')
        template = handlebars.compile(tsrc)
        cache[p] = template
      }
      context.body = template(data)
    },
    json (data) {
      context.type = 'application/json'
      context.body = JSON.stringify(data, null, 2)
    }
  }
}
