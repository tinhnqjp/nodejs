(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.users', {
        abstract: true,
        url: '/users',
        template: '<ui-view/>'
      })
      .state('admin.users.list', {
        url: '',
        templateUrl: '/modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic']
        }
      })
      .state('admin.users.create', {
        url: '/create',
        templateUrl: '/modules/users/client/views/authentication/signup.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic']
        },
        resolve: {
          userResolve: newUser
        }
      })
      .state('admin.users.edit', {
        url: '/:userId/edit',
        templateUrl: '/modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        data: {
          roles: ['admin', 'jaic']
        },
        resolve: {
          userResolve: getUser
        }
      });

    getUser.$inject = ['$stateParams', 'UsersAdminService'];

    function getUser($stateParams, UsersAdminService) {
      return UsersAdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }

    newUser.$inject = ['UsersAdminService'];

    function newUser(UsersAdminService) {
      return new UsersAdminService();
    }
  }
}());
