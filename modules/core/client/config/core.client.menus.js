(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenu('nav', {
      roles: ['user']
    });

    menuService.addMenuItem('nav', {
      title: '物件データ管理',
      parrent_state: 'admin.properties',
      state: 'admin.properties.list',
      roles: ['user']
    });
    menuService.addMenuItem('nav', {
      title: '法令管理',
      parrent_state: 'admin.laws',
      state: 'admin.laws.list',
      roles: ['user']
    });
    menuService.addMenuItem('nav', {
      title: 'チェックシート管理',
      parrent_state: 'admin.docs',
      state: 'admin.docs.list',
      roles: ['user']
    });
    menuService.addMenuItem('nav', {
      title: 'アカウント管理',
      parrent_state: 'admin.users',
      state: 'admin.users',
      roles: ['user']
    });

    menuService.addMenu('account', {
      roles: ['user']
    });


    menuService.addMenuItem('account', {
      title: '',
      state: 'settings',
      type: 'dropdown',
      roles: ['user']
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile',
      state: 'settings.profile'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Edit Profile Picture',
      state: 'settings.picture'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Change Password',
      state: 'settings.password'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'Manage Social Accounts',
      state: 'settings.accounts'
    });
  }
}());
