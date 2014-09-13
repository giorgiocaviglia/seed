// Express config

var express = require('express')
  , bodyParser = require('body-parser')

module.exports = function (app, config) {

  // set PORT
  app.set('port', process.env.PORT || 3000);
  // set views
  app.set('views', config.root + '/app/views');
  // set view engine (jade)
  app.set('view engine', 'jade');

  //app.use(express.logger('dev'));

  // body parser
  app.use(bodyParser.json())

  //app.use(express.methodOverride());
  app.use(express.static(config.root + '/public'));
  
}
