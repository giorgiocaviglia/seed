'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'ngRoute',
  'infinite-scroll',
  'ui.bootstrap',
  'myApp.controllers',
  'myApp.filters',
  'myApp.services',
  'myApp.directives'
]).
config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'partials/entries',
      controller: 'IndexCtrl'
    }).
    when('/search', {
      templateUrl: 'partials/search',
      controller: 'SearchCtrl'
    }).
    when('/search/:query', {
      templateUrl: 'partials/search',
      controller: 'SearchCtrl'
    }).
    when('/entries', {
      templateUrl: 'partials/entries',
      controller: 'EntriesCtrl'
    }).
    when('/entries/:id', {
      templateUrl: 'partials/entries',
      controller: 'EntriesCtrl'
    }).
    when('/stats', {
      templateUrl: 'partials/stats',
      controller: 'StatsCtrl'
    }).
    /*when('/articles/:id', {
      templateUrl: 'partials/article',
      controller: 'ArticleCtrl'
    }).*/
    otherwise({
      redirectTo: '/'
    });

  $locationProvider.html5Mode(true);
});
