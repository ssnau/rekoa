module.exports = async function (next) {
  this.name = "jack";
  await next;
};
