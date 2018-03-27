'use strict';

angular.module('core').controller('AppController', AppController);

AppController.$inject = ['$scope', 'Authentication', 'ngDialog', 'notifyService'];

function AppController($scope, Authentication, ngDialog, notifyService) {
  $scope.Authentication = Authentication;
  $scope.handleShowConfirm = handleShowConfirm;
  $scope.nofitySuccess = nofitySuccess;
  $scope.nofityError = nofityError;

  // Hiển thị confirm xác nhận
  function handleShowConfirm(content, resolve, reject) {
    $scope.dialog = content;
    ngDialog.openConfirm({
      templateUrl: 'confirmTemplate.html',
      scope: $scope
    }).then(res => {
      delete $scope.dialog;
      if (resolve) {
        resolve(res);
      }
    }, res => {
      delete $scope.dialog;
      if (reject) {
        reject(res);
      }
    });
  }

  function nofitySuccess(message) {
    return notifyService.success(message);
  }

  function nofityError(message) {
    return notifyService.error(message);
  }
}
