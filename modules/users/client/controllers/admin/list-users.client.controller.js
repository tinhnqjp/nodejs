(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserListController', UserListController);

  UserListController.$inject = ['UsersAdminService', '$scope', '$state', '$window', 'Authentication', 'Notification'];

  function UserListController(UsersAdminService, $scope, $state, $window, Authentication, Notification) {
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
      UsersAdminService.get(input, function (output) {
        vm.users = output.users;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    // remove user
    function remove(_user) {
      $scope.handleShowConfirm({
        message: 'このアカウントを削除します。よろしいですか？'
      }, function () {
        var user = new UsersAdminService({ _id: _user._id });
        user.$remove(function () {
          getData();
          $scope.nofitySuccess('アカウントの削除が完了しました。');
        });
      });
    }
  }
}());
