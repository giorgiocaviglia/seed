var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var debug = require('debug')('app4');
var mongoose = require('mongoose');
var fs = require('fs');
var basicAuth = require('basic-auth-connect');


// Bootstrap Mongo models
var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// db connection
mongoose.connect("mongodb://localhost/gt")

// express app
var app = express();

// set PORT
app.set('port', process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// authenticator
app.use(basicAuth('grandtour', 'johnadams'));

// Bootstrap routes
require('./config/routes')(app);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
