(function () {
  'use strict';

  // Configuring the Mentions Admin module
  angular
    .module('mentions.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: '特記様式管理',
      state: 'admin.mentions.list'
    });
  }
}());
