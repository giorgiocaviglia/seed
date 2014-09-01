// Parsing the text
var config = require('../../config/config')
	,	mongoose = require('mongoose')
  , Visit = mongoose.model('Visit')


exports.search = function (req, res) {

	var field = req.body.field
    , value = req.body.value
    , query = {}
		,	pipeline = [ { $group: { _id: '$' + field, count: { $sum: 1 } } }, { $sort: { count:-1 } } ]

	if (field.match(/\./)) {
    var elemMatch = {};
    elemMatch[field.split(".")[1]] = { $regex : new RegExp(value, "i") };
    query[field.split(".")[0]] = { $elemMatch : elemMatch };
    pipeline.unshift({ $unwind : '$' + field.split(".")[0] });
  } else {
    query[field] = { $regex : new RegExp(value, "i") };
  }

  pipeline.unshift({ $match: query });

  Visit
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