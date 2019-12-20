# rekoa

a simple web framework based on koa.

**NOTICE**: rekoa@3.x is based on koa@2.x and is not compatible with koa@1.x styled middlewares.

### features

- autoload middlewares, contexts and controllers
- auto hot reload without the need to restart the server

### example

```javascript
// index.js
var app = require('rekoa');

app({
  isDevelopment: true,
  base: __dirname,
  path: {
    middleware: path.join(__dirname, 'middleware'),
    controller: path.join(__dirname, 'controller')
  }
}).start();

// middleware/teapot
module.exports = async function (context, next) {
  context.name = "jack";
  await next();
};

// controller/greet.js

module.exports = [
  {
    url: '/greet',
    controller: async function (context, next) {
      context.body = "hello, i am " + this.name;
    }
  }
];
```

visit `http://localhost:8080/` you will get `hello, i am jack` and change middleware or controller file and save, you will get a new result without server restart.

A more featured example is under `example` folder.

### license

MIT
