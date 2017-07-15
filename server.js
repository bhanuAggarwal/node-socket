'use strict';

require('dotenv').config();

require('./server.babel');
const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');

const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3030;

const app = express();
const connection = connect();

const server = require('http').Server(app);
const io = require('socket.io')(server);

/**
 * Expose
 */

module.exports = {
  server,
  connection
};

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.indexOf('.js'))
  .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/express')(app);
require('./config/routes')(app);

connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen () {
  server.listen(port);
  console.log('Socket app started on port ' + port);
}

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  var connection = mongoose.connect(config.db, options).connection;
  return connection;
}

const meterController = require('./app/controllers/meter');

io.on('connection', function (socket){
  socket.on('addMeterReading', function(data){
    meterController.addMeterReading(socket, io, data)
  });
  socket.on('initGraphs', meterController.initGraph.bind(null, socket));
})