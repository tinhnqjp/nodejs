(function () {
  'use strict';

  angular
    .module('core')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addMenu('nav', {
      roles: ['admin', 'jaic', 'user']
    });

    menuService.addMenuItem('nav', {
      title: '物件データ管理',
      parrent_state: 'admin.properties',
      state: 'admin.properties.list',
      roles: ['admin', 'jaic', 'user']
    });
    menuService.addMenuItem('nav', {
      title: '法令管理',
      parrent_state: 'admin.laws',
      state: 'admin.laws.list',
      roles: ['admin']
    });
    menuService.addMenuItem('nav', {
      title: 'チェックシート管理',
      parrent_state: 'admin.docs',
      state: 'admin.docs.list',
      roles: ['admin', 'jaic', 'user']
    });
    menuService.addMenuItem('nav', {
      title: 'アカウント管理',
      parrent_state: 'admin.users',
      state: 'admin.users.list',
      roles: ['admin', 'jaic']
    });
    menuService.addMenuItem('nav', {
      title: 'ユーザ情報設定',
      parrent_state: 'settings',
      state: 'settings.profile',
      roles: ['admin', 'jaic', 'user']
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
      title: 'プロファイル編集',
      state: 'settings.profile'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'プロフィールの画像',
      state: 'settings.picture'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'パスワード変更',
      state: 'settings.password'
    });

    menuService.addSubMenuItem('account', 'settings', {
      title: 'ソーシャル',
      state: 'settings.accounts'
    });
  }
}());
