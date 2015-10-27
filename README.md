# rekoa

a simple web framework based on koa.

### features

- autoload middlewares, contexts and controllers
- auto hot reload without the need to restart the server

### example

```
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
module.exports = async function (next) {
  this.name = "jack";
  await next;
};

// controller/greet.js

module.exports = [
  {
    url: '/greet',
    controller: async function () {
      this.body = "hello, i am " + this.name;
    }
  }
];
```

visit `http://localhost:8080/` you will get `hello, i am jack` and change middleware or controller file and save, you will get a new result without server restart.

A more featured example is under `example` folder.

### license

MIT
