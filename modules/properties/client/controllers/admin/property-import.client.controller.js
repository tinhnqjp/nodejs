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
    vm.submitted = false;
    vm.currentPage = 1;
    vm.pageSize = 10;
    vm.listproperties = [];
    initData();

    /**
     * init
     */
    function initData() {
      var input = { page: vm.currentPage, limit: vm.pageSize };
      PropertyApi.requestPropertiesMysql(input)
      .then(function (res) {
        vm.listproperties = res.data.list;
        vm.totalItems = res.data.total;
        vm.currentPage = res.data.current;
      })
      .catch(function (res) {
        $scope.nofityError('マスターデータのロードが失敗しました。');
      });
    }

    /**
     * save property (add new / edit)
     * @param {*} isValid valid
     */
    function save(isValid) {
      if (!vm.property.application_id) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.importForm');
        $scope.nofityError('物件データが選択されていません');
        return false;
      }
      PropertyApi.importPropertyFormMysql(vm.property.application_id)
        .then(function (res) {
          console.log(res.data);
          vm.busy = false;
          // $state.go('admin.properties.list');
          $scope.nofitySuccess('物件データの保存が完了しました。');
        })
        .catch(function (res) {
          vm.busy = false;
          $scope.nofityError('物件データの保存が失敗しました。' + res.data.message);
        });
    }

    vm.pageChanged = function () {
      initData();
    };
  // end controller
  }
}());
