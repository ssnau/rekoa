module.exports = [
  {
    url: '/greet',
    controller: async function () {
      this.body = "hello, i am " + this.name;
    }
  }
];
