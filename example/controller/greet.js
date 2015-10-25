module.exports = [
  {
    url: '/greet',
    controller: async function () {
      this.jsonx({
        message: "hello, i am " + this.name
      });
    }
  },
  {
    url: '/greet/cat',
    controller: async function () {
      return {
        name: 'john'
      }
    }
  }
];
