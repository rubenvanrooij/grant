
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

var fs = require('fs')
var express = require('express')
var logger = require('morgan')
var bodyParser = require('body-parser')
var session = require('express-session')

var Grant = require('grant-express')
var grant = new Grant(require('./config.json'))

var request = require('request')

var app = express()
app.use(logger('dev'))
// REQUIRED:
app.use(session({secret: 'very secret'}))
// REQUIRED: (when making POST requests to /connect/:provider/:override?)
app.use(bodyParser.urlencoded({extended: true}))
// mount grant
app.use(grant)

app.get('/connect_facebook_post', (req, res) => {
  var url = grant.config.facebook.protocol + '://' +
    grant.config.facebook.host + '/connect/facebook'
  request.post(url, {
    form: {
      // generate 6 digit random state number on each authorization attempt
      state: (Math.floor(Math.random() * 999999) + 1)
    },
    followRedirect: false
  }, (err, _res, body) => {
    res.set('set-cookie', _res.headers['set-cookie'][0])
    res.redirect(_res.headers.location)
  })
})

app.get('/connect_facebook_get', (req, res) => {
  // generate 6 digit random state number on each authorization attempt
  var state = (Math.floor(Math.random() * 999999) + 1)

  res.redirect('/connect/facebook?state=' + state)
})

app.get('/handle_facebook_callback', (req, res) => {
  console.log('The state was', req.session.grant.state)
  console.log(req.query)
  res.end(JSON.stringify(req.query, null, 2))
})

app.get('/form', (req, res) => {
  res.writeHead(200, {'content-type': 'text/html'})
  res.end(fs.readFileSync('./form.html', 'utf8'))
})

app.listen(3000, () => {
  console.log('Express server listening on port ' + 3000)
})
