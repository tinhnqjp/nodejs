(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('Doc1AdminController', Doc1AdminController);

  Doc1AdminController.$inject = ['$scope', '$state', '$window', 'docResolve', 'propertyResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'DocsApi', 'LawsApi', 'PropertyApi', '$stateParams'];

  function Doc1AdminController($scope, $state, $window, doc, property, Authentication,
    Notification, Excel, $timeout, DocsApi, LawsApi, PropertyApi, $stateParams) {
    var vm = this;
    vm.propertyId;
    vm.doc = doc;
    vm.property = property;
    vm.authentication = Authentication;
    vm.listMasterLaw = [];
    vm.listMasterProperties = [];
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
      LawsApi.listMasterLaw()
        .then(function (res) {
          vm.busyLoad = false;
          vm.listMasterLaw = res.data;
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
      $scope.handleShowConfirm({
        message: '保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.lawRulesForm');
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
