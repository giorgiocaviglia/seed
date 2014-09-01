'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])
  
  .factory('apiService', function ($http, $q, $rootScope) {
	  
	  return {

	  	// 
	  	cleanRequest : function(request){
	  		clean(request);
	  		function clean(object){

	  			if (typeof object == 'object' && $.isEmptyObject(object) || object.length == 0 || object == "") return true;
	  			if (typeof object != 'object') return false;
	  			var save = true;
	  			for (var k in object){
	  				if (clean(object[k])) {
	  					delete object[k];
	  					//return true;
	  				} else save = false;
	  			}

	  			return save;
	  		}

	  	},

	    group : function (request){ 
		    return $.ajax({
	      	type : 'GET',
	      	data : JSON.stringify(request),
	      	dataType : 'json',
	      	contentType: 'application/json',
	      	url: 'api/group'
	      })
	    },

	    autocomplete : function(request, model){
	    	return $.ajax({
	      	type : 'POST',
	      	data : JSON.stringify(request),
	      	dataType : 'json',
	      	contentType: 'application/json',
	      	url: 'api/' + model + '/search'
	      })
	    },

	    parse : function (request){
	    	return $.ajax({
	      	type : 'GET',
	      	contentType: 'application/json',
	      	url: 'api/parse'
	      })
	    }
		}
	});
