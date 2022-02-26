module.exports = async function (context, next) {
    const start = Date.now();
    await next()
    context.set('server-time', Date.now() - start + 1);
  }
  