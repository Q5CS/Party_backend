const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa2-cors');

// const index = require('./routes/index')
// const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(cors({
  credentials: true
}));
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

// routes
// app.use(index.routes(), index.allowedMethods())
// app.use(users.routes(), users.allowedMethods())
// restaurant.init(app)

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const restaurant = require('./routes/restaurant')
const partyConfig = require('./config')
new restaurant(io, partyConfig.initAlgValue, partyConfig.maxAlgValue)

module.exports = http