(function () {
  'use strict';

  angular
    .module('laws')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenuItem('topbar', {
      title: 'Laws',
      state: 'laws',
      type: 'dropdown',
      roles: ['*']
    });

    // Add the dropdown list item
    menuService.addSubMenuItem('topbar', 'laws', {
      title: 'List Laws',
      state: 'laws.list',
      roles: ['*']
    });
  }
}());
