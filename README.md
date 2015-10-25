# rekoa

a simple web framework based on koa.

### features

- autoload middlewares, contexts and controllers
- auto hot reload without the need to restart the server

### example

```
var app = require('rekoa');

app({
  path: {
    middleware: __dirname + "/middleware" // tell rekoa where you middleware lies
    controller: __dirname + "/controller" // tell rekoa where you middleware lies
    context: __dirname + "/context" // tell rekoa where you middleware lies
  }
}).bootstrap();
```

### license

MIT
