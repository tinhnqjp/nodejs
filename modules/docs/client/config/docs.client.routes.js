(function () {
  'use strict';

  angular
    .module('docs.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('docs', {
        abstract: true,
        url: '/docs',
        template: '<ui-view/>'
      })
      .state('docs.list', {
        url: '',
        templateUrl: '/modules/docs/client/views/list-docs.client.view.html',
        controller: 'DocsListController',
        controllerAs: 'vm'
      })
      .state('docs.view', {
        url: '/:docId',
        templateUrl: '/modules/docs/client/views/view-doc.client.view.html',
        controller: 'DocsController',
        controllerAs: 'vm',
        resolve: {
          docResolve: getDoc
        },
        data: {
          pageTitle: '{{ docResolve.meishou }}'
        }
      });
  }

  getDoc.$inject = ['$stateParams', 'DocsService'];

  function getDoc($stateParams, DocsService) {
    return DocsService.get({
      docId: $stateParams.docId
    }).$promise;
  }
}());
