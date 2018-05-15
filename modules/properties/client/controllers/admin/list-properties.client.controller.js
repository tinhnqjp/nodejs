(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('PropertiesAdminListController', PropertiesAdminListController);

  PropertiesAdminListController.$inject = ['$scope', 'PropertiesService'];

  function PropertiesAdminListController($scope, PropertiesService) {
    var vm = this;
    vm.remove = remove;
    vm.search = search;
    vm.currentPage = 1;
    vm.pageSize = 10;
    vm.keyword = '';
    vm.busyLoad = false;
    initData();
    vm.pageChanged = function () {
      initData();
    };

    function initData() {
      vm.busyLoad = true;
      var input = { page: vm.currentPage, limit: vm.pageSize, keyword: vm.keyword };
      PropertiesService.get(input, function (output) {
        vm.busyLoad = false;
        vm.properties = output.properties;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
        console.log(output.total);
      });
    }

    function remove(_property) {
      $scope.handleShowConfirm({
        message: 'この物件データを削除します。よろしいですか？'
      }, function () {
        vm.busy = true;
        var property = new PropertiesService({ _id: _property._id });
        property.$remove(function () {
          initData();
          vm.busy = false;
          $scope.nofitySuccess('物件データの削除が完了しました。');
        });
      });
    }

    function search(isValid) {
      initData();
      console.log(vm.keyword);
    }
  }
}());
