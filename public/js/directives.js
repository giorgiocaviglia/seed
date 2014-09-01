'use strict';

/* Directives */

angular.module('myApp.directives', [])

  .directive('map', function () {
		
		return {
			scope: {
				points: '='
			},
			restrict: 'A',
			link: function preLink(scope, element, attrs) {

				d3.select(element[0])
					.style("width", element.width()+"px")
					.style("height", element.width()+"px");

				var map = L.map(element[0])
							.setView([41.872388900,	12.480180200], 4),
						l = new L.mapbox.tileLayer('cesta.hd9ak6ie');
       	map.addLayer(l);
				
				map._initPathRoot()    

				/* We simply pick up the SVG from the map object */
				var svg = d3.select(element[0])
						.select('svg'),
						g = svg.append("g")
				
				scope.$watch('points', function(points) {
					
					if (!points) return;

					/* Add a LatLng object to each item in the dataset */
					points = points.filter(function(d){
						return d.coordinates;
					})
					points.forEach(function(d) {
						d.LatLng = new L.LatLng(d.coordinates.lat, d.coordinates.lng)
					})
					
					var feature = g.selectAll("circle")
						.data(points)
						.enter().append("circle")
						.style("stroke-width", 0)  
						.style("opacity", .6) 
						.style("fill", "#333")
						.attr("r", 3);  
					
					map.on("viewreset", update);
					update();

					function update() {
						console.log('facendo cose')
						feature.attr("transform", 
						function(d) { 
							return "translate("+ 
								map.latLngToLayerPoint(d.LatLng).x +","+ 
								map.latLngToLayerPoint(d.LatLng).y +")";
							}
						)
					}
				})	

			}

		};
	})

 .directive('entry', function () {
		
		return {
			scope: {
				entry: '='
			},
			restrict: 'A',
			templateUrl: 'partials/entry',
			link: function postLink(scope, element, attrs) {

			}

	};})

