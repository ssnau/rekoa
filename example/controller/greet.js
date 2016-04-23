module.exports = [
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
    controller: function *() {
      response.json({
        name: 'john'
      })
    }
  }
];
