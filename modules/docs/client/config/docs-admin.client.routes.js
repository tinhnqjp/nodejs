(function () {
  'use strict';

  angular
    .module('docs.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.docs', {
        abstract: true,
        url: '/docs',
        template: '<ui-view/>'
      })
      .state('admin.docs.list', {
        url: '',
        templateUrl: '/modules/docs/client/views/admin/list-docs.client.view.html',
        controller: 'DocsAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.docs.create', {
        url: '/create',
        templateUrl: '/modules/docs/client/views/admin/form-doc.client.view.html',
        controller: 'DocsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          docResolve: newDoc
        }
      })
      .state('admin.docs.edit', {
        url: '/:docId/edit',
        templateUrl: '/modules/docs/client/views/admin/form-doc.client.view.html',
        controller: 'DocsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ docResolve.meishou }}'
        },
        resolve: {
          docResolve: getDoc
        }
      });
  }

  getDoc.$inject = ['$stateParams', 'DocsService'];

  function getDoc($stateParams, DocsService) {
    return DocsService.get({
      docId: $stateParams.docId
    }).$promise;
  }

  newDoc.$inject = ['DocsService'];

  function newDoc(DocsService) {
    return new DocsService();
  }
}());
