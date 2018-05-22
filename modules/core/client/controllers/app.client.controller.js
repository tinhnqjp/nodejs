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
  $scope.checkSheetRoHa = checkSheetRoHa;

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
    }).then(function (res) {
      delete $scope.dialog;
      if (resolve) {
        resolve(res);
      }
    }, function (res) {
      delete $scope.dialog;
      if (reject) {
        reject(res);
      }
    });
  }

  function handleShowDownload(dialog, resolve, reject) {
    $scope.dialog = dialog;
    $scope.dialog.isSaveOrOpenBlob = false;
    if (window.navigator.msSaveOrOpenBlob) {
      $scope.dialog.isSaveOrOpenBlob = true;
    }

    ngDialog.openConfirm({
      templateUrl: 'downloadTemplate.html',
      scope: $scope
    }).then(function (res) {
      if (window.navigator.msSaveOrOpenBlob) {
        var blob = new Blob([dialog.href], {
          type: 'application/csv;charset=utf-8;'
        });
        window.navigator.msSaveOrOpenBlob(blob, dialog.file);
      }

    }, function (res) {
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

  function checkSheetRoHa(value, checked, form4_ha1, form4_ro, listMaster, form) {
    if (!form4_ha1) {
      form4_ha1 = [];
    }
    var obj = _.find(listMaster, {
      id: value.toString()
    });
    console.log(value);
    var index;
    var ckHaClick = getRowspanCkHa(obj, form);
    console.log('ckHaClick', ckHaClick);
    if (ckHaClick === 0) {
      console.log();
      if (checked) {
        form4_ha1.push(value.toString());
      } else {
        index = form4_ha1.indexOf(value.toString());
        form4_ha1.splice(index, 1);
      }
    } else {
      var i = value;
      var ck_ha1 = 0,
        i_start = 0,
        i_end = 0;
      while (ck_ha1 <= 0) {
        obj = _.find(listMaster, {
          id: i.toString()
        });
        ck_ha1 = getRowspanCkHa(obj, form);
        console.log('ck_ha1', ck_ha1);
        if (ck_ha1 > 0) {
          if (checked && !_.contains(form4_ha1, i.toString())) {
            form4_ha1.push(i.toString());
          } else {
            i_start = parseInt(i, 10);
            i_end = parseInt(i, 10) + parseInt(ck_ha1, 10);
          }
          break;
        } else {
          i = i - 1;
        }
      }

      if (!checked && i_start) {
        var removeHa = true;
        for (var m = i_start; m < i_end; m++) {
          index = form4_ro.indexOf(m.toString());
          if (index > 0) {
            removeHa = false;
            break;
          }
        }
        if (removeHa) {
          index = form4_ha1.indexOf(i_start.toString());
          form4_ha1.splice(index, 1);
        }
      }
    }
    return form4_ha1;
  }

  function getRowspanCkHa(obj, form) {
    console.log(obj);
    var rowspan_ck_ha = 0;
    switch (form) {
      case 'form1':
        rowspan_ck_ha = obj.rowspan_ck_ha;
        break;
      case 'form4':
        rowspan_ck_ha = obj.rowspan_ck_ha1;
        break;
    }
    return parseInt(rowspan_ck_ha, 10);
  }
}
