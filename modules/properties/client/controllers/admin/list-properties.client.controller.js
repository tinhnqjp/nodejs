(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('PropertiesAdminListController', PropertiesAdminListController);

  PropertiesAdminListController.$inject = ['$scope', 'PropertiesService'];

  function PropertiesAdminListController($scope, PropertiesService) {
    var vm = this;
    vm.remove = remove;
    vm.currentPage = 1;
    vm.pageSize = 10;
    getData();
    vm.pageChanged = function () {
      getData();
    };

    function getData() {
      var input = { page: vm.currentPage, limit: vm.pageSize };
      PropertiesService.get(input, function (output) {
        vm.properties = output.properties;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    function remove(_property) {
      $scope.handleShowConfirm({
        message: 'この物件データを削除します。よろしいですか？'
      }, () => {
        vm.busy = true;
        var property = new PropertiesService({ _id: _property._id });
        property.$remove(function () {
          getData();
          vm.busy = false;
          $scope.nofitySuccess('物件データの削除が完了しました。');
        });
      });
    }

  }
}());
