(function () {
  'use strict';

  angular
    .module('articles.admin')
    .controller('ArticlesAdminListController', ArticlesAdminListController)
    .filter('pagination', ArticlesAdminListFilter);

  ArticlesAdminListController.$inject = ['$scope', 'ArticlesService'];

  function ArticlesAdminListController($scope, ArticlesService) {
    var vm = this;
    vm.currentPage = 3;
    vm.pageSize = 5;
    getData();

    vm.pageChanged = function () {
      getData();
    };

    function getData() {
      var input = { page: vm.currentPage, limit: vm.pageSize };
      ArticlesService.get(input, function (output) {
        vm.articles = output.articles;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }
  }

  function ArticlesAdminListFilter($filter) {
    return function (data, start) {
      return data.slice(start);
    };
  }
}());
