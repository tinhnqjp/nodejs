(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', '$state', '$window', 'Authentication', 'userResolve', 'Notification', 'UsersAdminService'];

  function UserController($scope, $state, $window, Authentication, user, Notification, UsersAdminService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.credentials = user;
    vm.remove = remove;
    vm.update = update;
    vm.isContextUserSelf = isContextUserSelf;
    console.log(vm.credentials);

    function remove(user) {
      if ($window.confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          vm.users.splice(vm.users.indexOf(user), 1);
          Notification.success('User deleted successfully!');
        } else {
          vm.credentials.$remove(function () {
            $state.go('admin.users');
            Notification.success({
              message: '<i class="glyphicon glyphicon-ok"></i> User deleted successfully!'
            });
          });
        }
      }
    }

    function update(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }
      var user = vm.credentials;
      
      user.$update(function () {
        $state.go('admin.users.list', {
          userId: user._id
        });
        Notification.success({
          message: '<i class="glyphicon glyphicon-ok"></i> User saved successfully!'
        });
      }, function (errorResponse) {
        Notification.error({
          message: errorResponse.data.message,
          title: '<i class="glyphicon glyphicon-remove"></i> User update error!'
        });
      });
    }

    function isContextUserSelf() {
      return vm.credentials.username === vm.authentication.user.username;
    }
  }
}());
