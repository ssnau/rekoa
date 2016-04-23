module.exports = function* (next) {
  this.name = "jack";
  yield next;
};
