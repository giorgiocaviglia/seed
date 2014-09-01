// controllers
var collection = require('../app/controllers/collection')
	,	entries = require('../app/controllers/entries')
	,	visits = require('../app/controllers/visits')

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

	// collection
	//app.get('/api/collection', collection.index)
	app.get('/api/collection/reset', collection.reset);

	// entries
	app.post('/api/entries', entries.index)
	app.post('/api/entries/search', entries.search)

	// visits
	app.post('/api/visits/search', visits.search)

	app.post('/api/search', collection.search);


	// redirect all others to the index (HTML5 history)
	app.get('*', function (req, res){
  		res.render('index');
	})
}

