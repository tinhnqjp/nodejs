(function () {
  'use strict';

  angular
    .module('docs.admin')
    .controller('Doc4AdminController', Doc4AdminController);

  Doc4AdminController.$inject = ['$scope', '$state', '$window', 'docResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'DocsApi', 'LawsApi', 'PropertyApi'];

  function Doc4AdminController($scope, $state, $window, doc, Authentication,
    Notification, Excel, $timeout, DocsApi, LawsApi, PropertyApi) {
    var vm = this;

    vm.doc = doc;
    vm.authentication = Authentication;
    vm.listMasterCheckSheetForm4 = [];
    vm.form = {};
    initData();

    /**
     * init method
     */
    function initData() {
      // load list data masterlaw
      DocsApi.listMasterCheckSheetForm4()
        .then(function (res) {
          vm.listMasterCheckSheetForm4 = res.data;
          console.log(vm.listMasterCheckSheetForm4);
        })
        .catch(function (res) {
          $scope.nofityError('マスターデータのロードが失敗しました。');
        });
    }

    /**
     * save to database rules
     * @param {*} isValid check validation
     */
    vm.save = function (isValid) {
      console.log(vm.doc);
      $scope.handleShowConfirm({
        message: '保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.docForm');
          return false;
        }
        vm.doc.createOrUpdate()
          .then(function (res) {
            $scope.nofitySuccess('第一号様式データの保存が完了しました。');
          })
          .catch(function (res) {
            $scope.nofityError('第一号様式データの保存が失敗しました。' + res.data.message);
          });
      });
    };

    /**
     * down file excel checksheet
     * @param {*} mendou form1, form4, form7
     */
    vm.download = function () {
      var href = $scope.exportExcel('#tableToExport', 'チェックシート');
      $scope.handleShowDownload({
        href: href,
        file: 'ダウンロード.xls',
        text: 'ダウンロード'
      });
    };


    // End controller
  }

  angular.module('docs.admin').filter('contains', function () {
    return function (array, needle) {
      if (!array) return 0;
      return array.indexOf(needle) >= 0;
    };
  });

}());
