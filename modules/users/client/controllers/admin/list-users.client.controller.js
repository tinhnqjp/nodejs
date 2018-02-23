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
        vm.users = output.users;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    // remove user
    function remove(_user) {
      if ($window.confirm('Are you sure you want to delete?')) {
        var user = new AdminUsersService({ _id: _user._id });
        user.$remove(function () {
          getData();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> user deleted successfully!' });
        });
      }
    }
  }
}());
