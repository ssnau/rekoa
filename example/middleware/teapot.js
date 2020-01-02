module.exports = async function (context, next) {
  context.firstName = 'jack'
  await next()
}
