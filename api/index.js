var express = require('express')
// var routes = require('./routes')
// var user = require('./routes/user')
var http = require('http')
// var path = require('path')

var app = express()

// all environments
// app.set('port', 5000)
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'pug')
// app.use(express.favicon())
// app.use(express.logger('dev'))
// app.use(express.methodOverride())
// app.use(express.session({ secret: 'WATCHDOGS426890' }))
// app.use(express.bodyParser())
// app.use(app.router)
// app.use(express.static(path.join(__dirname, 'public')))

// development only
// if (app.get('env') === 'development') {
//   app.use(express.errorHandler())
// }

app.get('/', (req,res)=>{
    res.send('Hello Zain')
})
// app.get('/users', user.list)

http.createServer(app).listen(5000, () => {
  console.log('Express server listening on port 5000')
})