'use strict';

/* Directives */

angular.module('myApp.directives', [])

 .directive('test', function () {
		
		return {
			restrict: 'A',
			templateUrl: 'partials/test',
			
			link: function postLink(scope, element, attrs) {

			}

	};})

