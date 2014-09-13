// controllers
var controller = require('../app/controllers/controller')

module.exports = function (app) {

	// serve index
	app.get('/', function (req, res){
  		res.render('index');
	})
	// serve (Angular) view partials
	app.get('/partials/:name', function (req, res) {
  		var name = req.params.name;
  		res.render('partials/' + name);
	});

	// test
	app.get('/api/controller', controller.test);

	// redirect all others to the index (HTML5 history)
	app.get('*', function (req, res){
  		res.render('index');
	})
}

