(function () {
  'use strict';

  angular
    .module('docs')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Docs',
      state: 'docs',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'docs', {
      title: 'List Docs',
      state: 'docs.list',
      roles: ['*']
    });
  }
}());
