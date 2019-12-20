console.log('load teapot')
module.exports =  async function (context, next) {
  console.log('-----teapot----')
  context.firstName= "jack";
  await next();
};
