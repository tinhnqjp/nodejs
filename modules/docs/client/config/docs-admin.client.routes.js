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
      .state('admin.docs.form1', {
        url: '/:docId/form1',
        templateUrl: '/modules/docs/client/views/admin/form-1.client.view.html',
        controller: 'Doc1AdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          docResolve: getDoc
        }
      }).state('admin.docs.form4', {
        url: '/:docId/form4',
        templateUrl: '/modules/docs/client/views/admin/form-4.client.view.html',
        controller: 'Doc4AdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          docResolve: getDoc
        }
      }).state('admin.docs.form7', {
        url: '/:docId/form7',
        templateUrl: '/modules/docs/client/views/admin/form-7.client.view.html',
        controller: 'Doc4AdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          docResolve: getDoc
        }
      }).state('admin.docs.mention', {
        url: '/:docId/mention',
        templateUrl: '/modules/docs/client/views/admin/form-mention.client.view.html',
        controller: 'MentionsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
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
