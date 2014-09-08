'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

  .controller('MainCtrl', function ($scope, $rootScope, $location, $controller, $http, $injector) {

    $rootScope.location = $location;

  })

  .controller('IndexCtrl', function ($scope, $http, $injector, apiService) {

    $scope.parse = function(){
      apiService.parse()
        .done(function(data){
          $scope.entries = data.entries;
          $scope.$apply();
        })
    }

    //$scope.parse();

  })

  .controller('ExploreCtrl', function ($scope, $http, $injector, apiService, $routeParams) {

    $scope.request = {};

    $scope.second = {};
    
    $scope.search = function(){
      // cleaning
      apiService.cleanRequest($scope.request);
      $http.post('api/search', JSON.stringify(sanitize($scope.request)))
        .then(function (res){
          //console.log(res)
          $scope.query = res.config.data;
          $scope.entries = res.data.response//.filter(function(d){ return d._id != null; }).map(function(d){ return d._id; });
          //$scope.$apply();
        })
    }

    $scope.find = function(str){
      $http.post('api/search', JSON.stringify(str))
        .then(function (res){
          console.log(res)
          $scope.query = res.config.data;
          $scope.entries = res.data.response//.filter(function(d){ return d._id != null; }).map(function(d){ return d._id; });
          //$scope.$apply();
        })
    }

    $scope.getItems = function(model, field, value){
        console.log(res)
      return $http.post('api/' + model + '/search', {
        value: value,
        field: field
      }).then(function(res){
        console.log(res)
        return  res.data.results.filter(function(d){ return d._id != null; }).map(function(d){ return d._id; });
      })
    }

    $scope.groupRequest = {
      collection: 'Travel',
      key: '$place'
    }

    function sanitize(obj){
      if (typeof obj != 'object') return obj;
      if($.isEmptyObject(obj)) return {};
      var san = {};
      for (var k in obj) {
        if (k.match(/^_\$/)) san[k.replace(/^_\$/,"$")] = sanitize(obj[k])
        else san[k] = sanitize(obj[k]);
      }
      return san;
    }

    function mongose(piece){
      var obj = { };
      for (var k in piece) {
       if($.isEmptyObject(piece[k])) continue;
       if (typeof piece[k] == 'object') {
          obj[k] = {};
          obj[k]['$elemMatch'] = mongose(piece[k]);
        } else {
          var val = {};
          val[k] = piece[k];
          return val;
        }
      }
      return obj;
    }


  })

  .controller('EntriesCtrl', function ($scope, $http, $injector, $routeParams) {

    if($routeParams.id) {
      var str = { id : $routeParams.id }
      $http.post('api/entries', JSON.stringify(str))
        .then(function (res){
          $scope.query = res.config.data;
          $scope.entry = res.data.result//.filter(function(d){ return d._id != null; }).map(function(d){ return d._id; });
          //$scope.$apply();
        })
    }  

  })

  .controller('SearchCtrl', function ($scope, $http, $injector, $location, $routeParams, apiService) {

    $scope.skip = 0;
    $scope.limit = 6000;

    $scope.loading = false;

    if($routeParams.query) {
      var request = {
        query: JSON.parse($routeParams.query),
        skip: $scope.skip,
        limit: $scope.limit
      }
      $scope.loading = true;
      $http.post('api/search', JSON.stringify(request))
        .then(function (res){
          $scope.loading = false;
          $scope.query = res.config.data;
          $scope.count = res.data.count;
          $scope.request = desanitize(JSON.parse($scope.query).query)
          //console.log($scope.request)
          $scope.entries = res.data.response//.filter(function(d){ return d._id != null; }).map(function(d){ return d._id; });
      })
    }

    $scope.request = {};

   /* $scope.nextPage = function(){
      $scope.skip+=$scope.limit;
      var request = {
        query: sanitize($scope.request),
        skip: $scope.skip,
        limit: $scope.limit
      }
      $http.post('api/search', JSON.stringify(request))
        .then(function (res){
          $scope.query = res.config.data;
          $scope.request = desanitize(JSON.parse($scope.query).query)
          //console.log($scope.request)
          $scope.entries = res.data.response//.filter(function(d){ return d._id != null; }).map(function(d){ return d._id; });
      })
    }*/
    
    $scope.submit = function(){
      apiService.cleanRequest($scope.request);
      $location.path( "/search/" + $scope.sanitize($scope.request) );
    }

    $scope.getItems = function(model, field, value) {
      return $http.post('api/' + model + '/search', {
        value: value,
        field: field
      }).then(function(res){
        return  res.data.results.filter(function(d){ return d._id != null; }).map(function(d){ return d._id; });
      })
    }

    $scope.clear = function(){
      $scope.request = {};
    }

    $scope.download = function(){

      apiService.cleanRequest($scope.request);
      var request = {
        query: JSON.parse($scope.sanitize($scope.request)),
        skip: $scope.skip,
        limit: $scope.limit
      }
      $http.post('api/download', JSON.stringify(request))
        .then(function (res){
          
          var entries = toCSV(res.data.response.entries);
          var visits = toCSV(res.data.response.visits);
          var places = toCSV(res.data.response.places);

          var zip = new JSZip();
          var folder = zip.folder("Grand Tour data export");
          folder.file("Entries.csv", entries);
          folder.file("Visits.csv", visits);
          folder.file("Places.csv", places);
          var content = zip.generate({type:"blob"});
          saveAs(content, "Grand Tour Export.zip");
      })

      
    
    }

    $scope.sanitize = function(obj) {
      return JSON.stringify(sanitize(obj))
    }

    function CSVEscape(field) {
      return '"' + String(field || "").replace(/\"/g, '""') + '"';
    }

    function toCSV(objArray) {

      var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

      var str = '';
      var line = '';

      var head = array[0];
      for (var index in array[0]) {
          var value = index + "";
          line += '"' + value.replace(/"/g, '""') + '",';
      }
      
      line = line.slice(0, -1);
      str += line + '\r\n';
      
      for (var i = 0; i < array.length; i++) {
        var line = [];

        for (var index in array[i]) {
            var value = array[i][index] == null || array[i][index].length == 0 ? "" : array[i][index] + "";
            line.push(value.length ? '"' + value.replace(/"/g, '""') + '"' : "")
        }
        line = line.join(",")
        str += line + '\r\n';
      }
      
      return str;
          
    }

    function sanitize(obj) {
      if (typeof obj != 'object') return obj;
      if($.isEmptyObject(obj)) return {};
      var san = {};
      for (var k in obj) {
        if (k.match(/^_\$/)) san[k.replace(/^_\$/,"$")] = sanitize(obj[k])
        else san[k] = sanitize(obj[k]);
      }
      return san;
    }

    function desanitize(obj) {
      if (typeof obj != 'object') return obj;
      if($.isEmptyObject(obj)) return {};
      var san = {};
      for (var k in obj) {
        if (k.match(/^\$/)) san[k.replace(/^\$/,"_$")] = desanitize(obj[k])
        else san[k] = desanitize(obj[k]);
      }
      return san;
    }



  })

  .controller('StatsCtrl', function ($scope, $http, $injector, apiService, $routeParams) {

    $scope.group = function(){
      apiService.group($scope.groupRequest)
        .done(function (data){
          console.log(data)
          $scope.groups = data.response;
          $scope.$apply();
      })
    }

    $scope.group()

    

  })