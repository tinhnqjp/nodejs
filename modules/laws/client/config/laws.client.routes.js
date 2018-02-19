(function () {
  'use strict';

  angular
    .module('laws.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('laws', {
        abstract: true,
        url: '/laws',
        template: '<ui-view/>'
      })
      .state('laws.list', {
        url: '',
        templateUrl: '/modules/laws/client/views/list-laws.client.view.html',
        controller: 'LawsListController',
        controllerAs: 'vm'
      })
      .state('laws.view', {
        url: '/:lawId',
        templateUrl: '/modules/laws/client/views/view-law.client.view.html',
        controller: 'LawsController',
        controllerAs: 'vm',
        resolve: {
          lawResolve: getLaw
        },
        data: {
          pageTitle: '{{ lawResolve.title }}'
        }
      });
  }

  getLaw.$inject = ['$stateParams', 'LawsService'];

  function getLaw($stateParams, LawsService) {
    return LawsService.get({
      lawId: $stateParams.lawId
    }).$promise;
  }
}());
