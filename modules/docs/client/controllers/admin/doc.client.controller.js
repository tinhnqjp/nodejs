(function () {
  'use strict';

  angular
    .module('docs.admin')
    .controller('DocsAdminController', DocsAdminController);

  DocsAdminController.$inject = ['$scope', '$state', '$window', 'docResolve', 'Authentication', 'Notification', 'Excel', '$timeout', 'LawsApi'];

  function DocsAdminController($scope, $state, $window, doc, Authentication, Notification, Excel, $timeout, LawsApi) {
    var vm = this;

    vm.doc = doc;
    vm.authentication = Authentication;
    vm.listMasterLaw = [];
    vm.form = {};
    initData();

    function initData() {

      LawsApi.listMasterLaw()
      .then((res) => {
        vm.listMasterLaw = res.data;
        // console.log(vm.listMasterLaw);
      })
      .catch((res) => {
        $scope.nofityError('マスターデータのロードが失敗しました。');
      });
    }

    /**
     * save to database rules
     * @param {*} isValid check validation
     */
    vm.save = function (isValid) {
      $scope.handleShowConfirm({ message: '保存します。よろしいですか？' }, () => {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.lawRulesForm');
          return false;
        }
        vm.doc.createOrUpdate()
        .then((res) => {
          $scope.nofitySuccess('第一号様式データの保存が完了しました。');
        })
        .catch((res) => {
          $scope.nofityError('第一号様式データの保存が失敗しました。' + res.data.message);
        });
      });
    };

    vm.download = function (mendou) {
      $timeout(function () {}, 1000);
      var tableId = '#tableToExport';
      // tableId
      var exportHref = Excel.tableToExcel(tableId, 'チェックシート');
      $timeout(function () { location.href = exportHref; }, 100); // trigger download
    };

  }

  angular.module('docs.admin').filter('contains', function () {
    return function (array, needle) {
      return array.indexOf(needle) >= 0;
    };
  });

  angular.module('docs.admin').factory('Excel', function ($window) {
    var uri = 'data:application/vnd.ms-excel;base64,',
      template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"'
      + ' xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>'
      + '<x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>'
      + '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table>'
      + '</body></html>',
      base64 = function (s) { return $window.btoa(unescape(encodeURIComponent(s))); },
      format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }); };
    return {
      tableToExcel: function (tableId, worksheetName) {
        var table = $(tableId),
          ctx = { worksheet: worksheetName, table: table.html() },
          href = uri + base64(format(template, ctx));
        return href;
      }
    };
  });
}());
