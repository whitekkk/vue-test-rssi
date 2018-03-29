var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var server = require('http').Server(app)
var io = require('socket.io')(server)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

var network = require('network')
const scanner = require('node-wifi-scanner')

// Initialize wifi module
// Absolutely necessary even to set interface to null

app.use(express.static('dist'))

  // var speedTest = require('speedtest-net')
  // var snmp = require('snmp-native')
  // var moment = require('moment')
  var host = ''
  var valx = 0
  getGateway()
  // getVal()
  var community = 'public'

  function timestamp(time){
      return (time/360000 |0)
  }
  function getGateway(){
    network.get_gateway_ip(function(err, ip) {
      host = (err || ip)
      // console.log(ip)
    })
  }

  io.on('connection', function (socket) {
    setInterval(function(){
      scanner.scan((err, networks) => {
        if (err) {
          // console.error(err)
          return
        }
        // console.log(networks)
        socket.emit('wifi', networks)
        // console.log(networks)
      })
    }, 5000)
  })

  app.set('port', (process.env.PORT || 3001))
  server.listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env)
  })
