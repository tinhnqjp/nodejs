(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('Doc7AdminController', Doc7AdminController);

  Doc7AdminController.$inject = ['$scope', '$state', '$window', 'docResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'DocsApi', 'LawsApi', 'PropertyApi', '$stateParams'];

  function Doc7AdminController($scope, $state, $window, doc, Authentication,
    Notification, Excel, $timeout, DocsApi, LawsApi, PropertyApi, $stateParams) {
    var vm = this;
    vm.propertyId;
    vm.doc = doc;
    vm.authentication = Authentication;
    vm.listTable1 = [];
    vm.listTable2 = [];
    vm.listTable3 = [];
    vm.listTable4 = [];
    vm.form = {};
    vm.busyLoad = false;
    initData();

    /**
     * init method
     */
    function initData() {
      vm.busyLoad = true;
      vm.propertyId = $stateParams.propertyId;
      // load list data masterlaw
      DocsApi.listMasterCheckSheetForm7()
        .then(function (res) {
          vm.busyLoad = false;
          var list = res.data;
          vm.listTable1 = _.filter(list, { table: 1 });
          vm.listTable2 = _.filter(list, { table: 2 });
          vm.listTable3 = _.filter(list, { table: 3 });
          vm.listTable4 = _.filter(list, { table: 4 });
        })
        .catch(function (res) {
          vm.busyLoad = false;
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
            $scope.nofitySuccess('第七号様式データの保存が完了しました。');
          })
          .catch(function (res) {
            $scope.nofityError('第七号様式データの保存が失敗しました。' + res.data.message);
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

  angular.module('properties.admin').filter('contains', function () {
    return function (array, needle) {
      if (!array) return 0;
      return array.indexOf(needle) >= 0;
    };
  });

}());
