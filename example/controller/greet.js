module.exports = [
  {
    url: '/',
    controller: function* (response) {
      response.json({
        message: "hello, i am index"
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
  }
];
