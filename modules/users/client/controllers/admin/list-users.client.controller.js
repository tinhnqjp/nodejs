(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserListController', UserListController);

  UserListController.$inject = ['AdminUsersService', '$scope', '$state', '$window', 'Authentication', 'Notification'];

  function UserListController(AdminUsersService, $scope, $state, $window, Authentication, Notification) {
    var vm = this;

    vm.currentPage = 1;
    vm.pageSize = 5;
    getData();

    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;

    vm.pageChanged = function () {
      getData();
    };

    function getData() {
      var input = { page: vm.currentPage, limit: vm.pageSize };
      AdminUsersService.get(input, function (output) {
        console.log(output);
        vm.users = output.users;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    // remove user
    function remove(_user) {
      if ($window.confirm('Are you sure you want to delete?')) {
        _user.$remove(function () {
          vm.users = AdminUsersService.query();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> user deleted successfully!' });
        });
      }
    }

    function successCallback(res) {
      vm.users = AdminUsersService.query();
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> user copy successfully!' });
    }

    function errorCallback(res) {
      Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> user copy error!' });
    }
  }
}());
