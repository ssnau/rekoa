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
    controller: function* (response) {
      response.json({
        message: "hello, i am " + this.name
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
