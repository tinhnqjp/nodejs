'use strict';

angular.module('core').controller('AppController', AppController);

AppController.$inject = ['$scope', '$timeout', '$window', 'Authentication', 'ngDialog', 'notifyService', 'Excel'];

function AppController($scope, $timeout, $window, Authentication, ngDialog, notifyService, Excel) {
  $scope.Authentication = Authentication;
  $scope.handleShowConfirm = handleShowConfirm;
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

  function exportExcel(tableId, sheetName, fileName) {
    $timeout(function () {}, 1000);
    // tableId
    var exportHref = Excel.tableToExcel(tableId, sheetName, fileName);
    $timeout(function () {
      exportHref.click();
    }, 1000); // trigger download
  }
}
