'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

  .controller('MainCtrl', function ($scope, $rootScope, $location, $controller, $http, $injector) {

    $rootScope.location = $location;

    console.log('main')

  })

  .controller('AboutCtrl', function ($scope, $rootScope, $location, $controller, $http, $injector) {

    console.log('about')

  })
