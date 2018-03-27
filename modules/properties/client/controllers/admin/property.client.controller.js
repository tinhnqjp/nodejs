(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('PropertiesAdminController', PropertiesAdminController);

  PropertiesAdminController.$inject = ['$scope', '$state', '$window', 'propertyResolve', 'Authentication', 'Notification', 'PropertiesService'];

  function PropertiesAdminController($scope, $state, $window, property, Authentication, Notification, PropertiesService) {
    var vm = this;
    
    vm.property = property;
    vm.authentication = Authentication;
    vm.form = {};
    vm.save = save;
    vm.submitted = false;
    initData();
    function initData () {
      vm.property.men10 = new Date(vm.property.men10);
    }

    // Save Property
    function save(isValid) {
      if (!isValid) {
        console.log(vm.form.propertyForm);
        vm.submitted = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.form.propertyForm');
        return false;
      }
      vm.property.createOrUpdate()
        .then((res) => {
          vm.busy = false;
          $state.go('admin.properties.list');
          $scope.nofitySuccess('物件データの保存が完了しました。');
        })
        .catch((res) => {
          vm.busy = false;
          $scope.nofityError('物件データの保存が失敗しました。' + res.data.message);
        });
    }

    vm.classError = (property) => {
      if (vm.submitted) {
        if (property) {
          return 'has-error';
        } {
          return 'has-success';
        }
      }
      return '';
    };
  // end controller
  }
}());

