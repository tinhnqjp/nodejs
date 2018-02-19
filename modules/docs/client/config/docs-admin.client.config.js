(function () {
  'use strict';

  // Configuring the Docs Admin module
  angular
    .module('docs.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'ドキュメント管理',
      state: 'admin.docs.list'
    });
  }
}());
