let tracingApp = angular.module('tracingApp', ['ui.router', 'ngResource'])

  .factory('Resource', function($resource) {
    return $resource('test.php', {id: '@id'}, {
      get: {method: 'GET'},
      update: {method: 'PUT'},
      query:  {method:'GET', isArray:true},
      save: {method: 'POST'},
      delete: {method: 'DELETE'}
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('selected', {
        url: "/document/:id",
        templateUrl: "app/tracing/tracing.view.html"
      })
      .state('list', {
        url: "/",
        templateUrl: "app/documents-list/documents-list.view.html"
      });

    $urlRouterProvider.otherwise('/');

  })
  .controller('appController', appController )
  .controller('documentsListController', DocumentsListController )
  .controller('tracingController', TracingController )
  .controller('documentController', DocumentController )
  .controller('toolbarController', ToolbarController )
  .factory('appService', appService );
