import Dumb from '../service/Dumb'
import Today from '../service/today'
import Man from '../service/man'
module.exports = [
  {
    url: '/',
    controller: async function (response, context, today) {
      const end = context.startTime('index', 'index')
      await sleep(100)
      end()
      console.log(context.serverTimings)
      response.json({
        message: `path: / hello ${context.firstName}, i am index, timestamp: ${today.now()}`
      })
    }
  },
  {
    url: '/greet',
    controller: function * (response, dumb, Dumb) {
      response.json({
        message: 'path: /greet hello, i am ' + dumb.getName() + '$$' + Dumb.getName()
      })
    }
  },
  {
    url: '/greet/cat',
    controller: function * (response) {
      response.render({ name: 'john' }, 'greet/cat/index.hbs')
    }
  },
  {
    url: '/greet/car',
    controller: function * (response, Test$Car) {
      this.body = Test$Car.getStatus()
    }
  },
  {
    url: ['/abc', '/acb', '/bac', '/bca', '/cab', '/cba'],
    controller: async function (context) {
      context.body = 'i am abc'
    }
  },
  {
    url: ['/getinjections'],
    controller: async function (context) {
      const [dumb, today] = await context.getInjections([Dumb, Today])
      context.body = dumb.getName() + '/' + today.hi()
    }
  },
  {
    url: ['/man'],
    controller: async function (context) {
      const [man] = await context.getInjections([Man])
      context.body = man.today.hi()
    }
  }

]

function sleep (ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}
