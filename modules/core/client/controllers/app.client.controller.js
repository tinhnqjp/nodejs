'use strict';

angular.module('core').controller('AppController', AppController);

AppController.$inject = ['$scope', '$timeout', '$window', 'Authentication', 'ngDialog', 'notifyService', 'Excel'];

function AppController($scope, $timeout, $window, Authentication, ngDialog, notifyService, Excel) {
  $scope.Authentication = Authentication;
  $scope.handleShowConfirm = handleShowConfirm;
  $scope.handleShowDownload = handleShowDownload;
  $scope.nofitySuccess = nofitySuccess;
  $scope.nofityError = nofityError;
  $scope.exportExcel = exportExcel;

  $scope.range = function (min, max, step) {
    step = step || 1;
    var input = [];
    for (var i = min; i <= max; i += step) {
      input.push(i);
    }
    return input;
  };

  // modal confirm
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

  function handleShowDownload(dialog, resolve, reject) {
    $scope.dialog = dialog;
    ngDialog.openConfirm({
      templateUrl: 'downloadTemplate.html',
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

  function exportExcel(tableId, sheetName) {
    return Excel.tableToExcel(tableId, sheetName);
  }
}
