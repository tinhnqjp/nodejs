(function () {
  'use strict';

  angular
    .module('properties.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.properties', {
        abstract: true,
        url: '/properties',
        template: '<ui-view/>'
      })
      .state('admin.properties.list', {
        url: '',
        templateUrl: '/modules/properties/client/views/admin/list-properties.client.view.html',
        controller: 'PropertiesAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic', 'user']
        }
      })
      .state('admin.properties.import', {
        url: '/import',
        templateUrl: '/modules/properties/client/views/admin/import-property.client.view.html',
        controller: 'PropertyImportsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic']
        },
        resolve: {
          propertyResolve: newProperty
        }
      })
      .state('admin.properties.create', {
        url: '/create',
        templateUrl: '/modules/properties/client/views/admin/form-property.client.view.html',
        controller: 'PropertiesAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic', 'user']
        },
        resolve: {
          propertyResolve: newProperty
        }
      })
      .state('admin.properties.edit', {
        url: '/:propertyId/edit',
        templateUrl: '/modules/properties/client/views/admin/form-property.client.view.html',
        controller: 'PropertiesAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic', 'user']
        },
        resolve: {
          propertyResolve: getProperty
        }
      }).state('admin.properties.form1', {
        url: '/:propertyId/form1',
        templateUrl: '/modules/properties/client/views/admin/doc-form-1.client.view.html',
        controller: 'Doc1AdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic', 'user']
        },
        resolve: {
          propertyResolve: getProperty,
          docResolve: getDoc
        }
      }).state('admin.properties.form4', {
        url: '/:propertyId/form4',
        templateUrl: '/modules/properties/client/views/admin/doc-form-4.client.view.html',
        controller: 'Doc4AdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic', 'user']
        },
        resolve: {
          propertyResolve: getProperty,
          docResolve: getDoc
        }
      }).state('admin.properties.form7', {
        url: '/:propertyId/form7',
        templateUrl: '/modules/properties/client/views/admin/doc-form-7.client.view.html',
        controller: 'Doc7AdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic', 'user']
        },
        resolve: {
          propertyResolve: getProperty,
          docResolve: getDoc
        }
      }).state('admin.properties.mention', {
        url: '/:propertyId/mention',
        templateUrl: '/modules/properties/client/views/admin/doc-form-mention.client.view.html',
        controller: 'MentionsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic', 'user']
        },
        resolve: {
          propertyResolve: getProperty,
          docResolve: getDoc
        }
      });
  }

  getProperty.$inject = ['$stateParams', 'PropertiesService'];

  function getProperty($stateParams, PropertiesService) {
    var result = PropertiesService.get({
      propertyId: $stateParams.propertyId
    }).$promise;
    return result;
  }

  newProperty.$inject = ['PropertiesService'];

  function newProperty(PropertiesService) {
    return new PropertiesService();
  }

  getDoc.$inject = ['$location', '$stateParams', 'DocsService', 'PropertiesService'];

  function getDoc($location, $stateParams, DocsService, PropertiesService) {
    if (!$stateParams.propertyId) {
      $location.path( '/admin/properties' );
    }
    return new Promise(function (resolve, reject) {
      getPropertyPromise(PropertiesService, $stateParams.propertyId)
      .then(function (_property) {
        return getDocPromise(DocsService, _property.doc);
      }).then(function (_doc) {
        resolve(_doc);
      });
    });
  }

  function getPropertyPromise(PropertiesService, propertyId) {
    return new Promise(function (resolve, reject) {
      var property = PropertiesService.get({
        propertyId: propertyId
      }).$promise;
      resolve(property);
    });
  }
  function getDocPromise(DocsService, docId) {
    return new Promise(function (resolve, reject) {
      var doc = DocsService.get({
        docId: docId
      }).$promise;
      resolve(doc);
    });
  }

}());
