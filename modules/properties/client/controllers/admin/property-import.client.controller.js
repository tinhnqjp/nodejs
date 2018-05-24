(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('PropertyImportsAdminController', PropertyImportsAdminController);

  PropertyImportsAdminController.$inject = ['$scope', '$state', '$window', 'propertyResolve', 'Authentication', 'Notification', 'PropertiesService', 'PropertyApi'];

  function PropertyImportsAdminController($scope, $state, $window, property, Authentication, Notification, PropertiesService, PropertyApi) {
    var vm = this;

    vm.property = property;
    vm.authentication = Authentication;
    vm.form = {};
    vm.save = save;
    vm.search = search;
    vm.submitted = false;
    vm.currentPage = 1;
    vm.pageSize = 10;
    vm.listproperties = [];
    vm.busy = false;
    vm.busyLoad = false;
    vm.isAllSelected = false;
    vm.keyword = '';
    initData();

    /**
     * init
     */
    function initData() {
      if (!vm.busyLoad) {
        vm.busyLoad = true;
        var input = { page: vm.currentPage, limit: vm.pageSize, keyword: vm.keyword };
        PropertyApi.requestPropertiesMysql(input)
        .then(function (res) {
          vm.busyLoad = false;
          vm.listproperties = res.data.list;
          vm.totalItems = res.data.total;
          vm.currentPage = res.data.current;
        })
        .catch(function (res) {
          vm.busyLoad = false;
          $scope.nofityError('マスターデータのロードが失敗しました。');
        });
      }
    }

    function search(isValid) {
      initData();
      console.log(vm.keyword);
    }
    /**
     * save property (add new / edit)
     * @param {*} isValid valid
     */
    function save(isValid) {
      $scope.handleShowConfirm({
        message: 'このデータを選択します。よろしいですか？'
      }, function () {
        vm.busy = true;
        if (!vm.property.application_id) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.importForm');
          $scope.nofityError('物件データが選択されていません');
          return false;
        }
        // change request from list to a value
        PropertyApi.importPropertyFormMysql(vm.property.application_id)
          .then(function (res) {
            console.log(res.data);
            vm.busy = false;
            $state.go('admin.properties.edit', { propertyId: res.data._id });
            $scope.nofitySuccess('物件データの保存が完了しました。');
          })
          .catch(function (res) {
            vm.busy = false;
            $scope.nofityError('物件データの保存が失敗しました。' + res.data.message);
          });
      });
    }

    vm.pageChanged = function () {
      initData();
    };

  // end controller
  }
}());
