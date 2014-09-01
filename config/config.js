// Main config
var path = require('path');

module.exports = {
	root: path.normalize(__dirname + '/..'),
  db: 'mongodb://localhost/gt',
  app: {
    name: 'Grand Tour Explorer'
  }
}