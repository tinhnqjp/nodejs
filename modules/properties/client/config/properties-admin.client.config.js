(function () {
  'use strict';

  // Configuring the properties Admin module
  angular
    .module('properties.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: '物件データ管理',
      state: 'admin.properties.list'
    });
  }
}());
