exports.response = function(res, property){
	return function (err, result) {
    if (err) { 
      res.json({ errors: err });
    }
    var response = {};
    response[property] = result;
    res.json(response);
  }
}