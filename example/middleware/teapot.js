module.exports = async function (next) {
  this.body = 'this is a teapot900';
  await next;
};
