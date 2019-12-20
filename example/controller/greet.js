module.exports = [
  {
    url: '/',
    controller: async function (response, context) {
      response.json({
        message: `hello ${context.firstName}, i am index`
      });
    }
  },
  {
    url: '/greet',
    controller: function* (response, dumb, Dumb) {
      response.json({
        message: "hello, i am " + dumb.getName() + '$$' + Dumb.getName()
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
  }

];
