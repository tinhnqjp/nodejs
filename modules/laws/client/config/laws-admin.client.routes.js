(function () {
  'use strict';

  angular
    .module('laws.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.laws', {
        abstract: true,
        url: '/laws',
        template: '<ui-view/>'
      })
      .state('admin.laws.list', {
        url: '',
        templateUrl: '/modules/laws/client/views/admin/list-laws.client.view.html',
        controller: 'LawsAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '法令管理一覧'
        }
      })
      .state('admin.laws.create', {
        url: '/create',
        templateUrl: '/modules/laws/client/views/admin/form-law.client.view.html',
        controller: 'LawsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '法令登録'
        },
        resolve: {
          lawResolve: newLaw
        }
      })
      .state('admin.laws.edit', {
        url: '/:lawId/edit',
        templateUrl: '/modules/laws/client/views/admin/form-law.client.view.html',
        controller: 'LawsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '法令登録'
        },
        resolve: {
          lawResolve: getLaw
        }
      });
  }

  getLaw.$inject = ['$stateParams', 'LawsService'];

  function getLaw($stateParams, LawsService) {
    return LawsService.get({
      lawId: $stateParams.lawId
    }).$promise;
  }

  newLaw.$inject = ['LawsService'];

  function newLaw(LawsService) {
    return new LawsService();
  }
}());
