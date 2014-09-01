// Parsing the text
var config = require('../../config/config')
	,	mongoose = require('mongoose')
  , Entry = mongoose.model('Entry')


exports.index = function(req, res){

	Entry.findById(req.body.id, function (err, response){
		if (err) {
      res.json({ error: err })
      return;
    }
    res.json({
      result: response
    });
	})

}


// Suggest

exports.suggest = function (req, res) {

  var field = req.body.field
    , value = req.body.value
    , query = {}
    , pipeline = [ { $group: { _id: '$' + field, count: { $sum: 1 } } }, { $sort: { count:-1 } } ]

  if (field.match(/\./)) {
    var elemMatch = {};
    if (field.match(/\.$/)) {
      elemMatch = { $regex : new RegExp(value, "i") };
      pipeline[0].$group._id = '$' + field.split(".")[0];
    }
    else elemMatch[field.split(".")[1]] = { $regex : new RegExp(value, "i") };
    
    query[field.split(".")[0]] = { $elemMatch : elemMatch };

    pipeline.unshift({ $unwind : '$' + field.split(".")[0] });
  
  } else {
    query[field] = { $regex : new RegExp(value, "i") };
  }

  pipeline.unshift({ $match: query });

  console.log(pipeline)

  Entry
    .aggregate(pipeline)
    .exec(function (err, response) {
      if (err) {
        res.json({ error: err })
        return;
      }
      res.json({
        results: response
      });
    })

}


exports.search = function (req, res) {

	var field = req.body.field
    , value = req.body.value
    , query = {
        _id: { $regex : new RegExp(value, "i") }
      }
		,	pipeline = [ { $group: { _id: '$' + field, count: { $sum: 1 } } }, { $sort: { count:-1 } } ]

	if (field.match(/\./)) {
    var elemMatch = {};
    if (field.match(/\.$/)) {
    	elemMatch = { $regex : new RegExp(value, "i") };
    	pipeline[0].$group._id = '$' + field.split(".")[0];
    }
    else elemMatch[field.split(".")[1]] = { $regex : new RegExp(value, "i") };
    
    pipeline.unshift({ $unwind : '$' + field.split(".")[0] });
  }

  pipeline.push({ $match: query });

  console.log(pipeline)

  Entry
    .aggregate(pipeline)
    .exec(function (err, response) {
      if (err) {
        res.json({ error: err })
        return;
      }
      res.json({
        results: response
      });
    })

}