module.exports = [
  {
    url: '/',
    controller: async function (response, context, today) {
      response.json({
        message: `path: / hello ${context.firstName}, i am index, timestamp: ${today.now()}`
      });
    }
  },
  {
    url: '/greet',
    controller: function* (response, dumb, Dumb) {
      response.json({
        message: "path: /greet hello, i am " + dumb.getName() + '$$' + Dumb.getName()
      });
    }
  },
  {
    url: '/greet/cat',
    controller: function *(response) {
      response.render({name: 'john'}, 'greet/cat/index.hbs')
    }
  },
  {
    url: '/greet/car',
    controller: function *(response, Test$Car) {
      this.body = Test$Car.getStatus();
    }
  },
  {
    url: ['/abc', '/acb', '/bac',  '/bca', '/cab', '/cba'],
    controller: async function (context) {
      context.body = 'i am abc'
    }
  }
];
