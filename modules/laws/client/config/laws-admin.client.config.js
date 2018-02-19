(function () {
  'use strict';

  // Configuring the Laws Admin module
  angular
    .module('laws.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: '法令管理',
      state: 'admin.laws.list'
    });
  }
}());
