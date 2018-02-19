(function () {
  'use strict';

  angular
    .module('articles.admin')
    .controller('ArticlesAdminListController', ArticlesAdminListController)
    .filter('pagination', ArticlesAdminListFilter);

  ArticlesAdminListController.$inject = ['ArticlesService'];

  function ArticlesAdminListController(ArticlesService) {
    var vm = this;

    vm.articles = ArticlesService.query();
    vm.pageSize = 5;
    vm.currentPage = 3;
  }

  function ArticlesAdminListFilter($filter) {
    return function (data, start) {
      return data.slice(start);
    };
  }
}());
