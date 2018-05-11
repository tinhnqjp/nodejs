﻿(function () {
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
          roles: ['admin', 'jaic', 'user']
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
}());
