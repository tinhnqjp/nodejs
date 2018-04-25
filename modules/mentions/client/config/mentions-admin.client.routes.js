(function () {
  'use strict';

  angular
    .module('mentions.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.mentions', {
        abstract: true,
        url: '/mentions',
        template: '<ui-view/>'
      })
      .state('admin.mentions.list', {
        url: '',
        templateUrl: '/modules/mentions/client/views/admin/list-mentions.client.view.html',
        controller: 'MentionsAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        }
      })
      .state('admin.mentions.create', {
        url: '/create',
        templateUrl: '/modules/mentions/client/views/admin/form-mention.client.view.html',
        controller: 'MentionsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin']
        },
        resolve: {
          mentionResolve: newMention
        }
      })
      .state('admin.mentions.edit', {
        url: '/:mentionId/edit',
        templateUrl: '/modules/mentions/client/views/admin/form-mention.client.view.html',
        controller: 'MentionsAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '{{ mentionResolve.title }}'
        },
        resolve: {
          mentionResolve: getMention
        }
      });
  }

  getMention.$inject = ['$stateParams', 'MentionsService'];

  function getMention($stateParams, MentionsService) {
    return MentionsService.get({
      mentionId: $stateParams.mentionId
    }).$promise;
  }

  newMention.$inject = ['MentionsService'];

  function newMention(MentionsService) {
    return new MentionsService();
  }
}());
