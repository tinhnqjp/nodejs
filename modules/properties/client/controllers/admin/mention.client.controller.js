(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('MentionsAdminController', MentionsAdminController);

  MentionsAdminController.$inject = ['$scope', '$state', '$window', 'propertyResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'PropertyApi', 'LawsApi', '$stateParams'];

  function MentionsAdminController($scope, $state, $window, property, Authentication,
    Notification, Excel, $timeout, PropertyApi, LawsApi, $stateParams) {
    var vm = this;
    vm.propertyId = null;
    vm.property = property;
    vm.authentication = Authentication;
    vm.form = {};
    vm.listMasterLawTdfk = [];
    vm.isTdfk = false;
    vm.busyLoad = false;
    initData();

    function initData() {
      vm.propertyId = vm.property._id;
      if (!vm.property.doc.mentions) {
        vm.property.doc.mentions = [];
      }

      if (vm.property.men3_1_1 === '東京都') {
        vm.busyLoad = true;
        vm.isTdfk = true;
        LawsApi.listMasterLawTdfk()
        .then(function (rs) {
          vm.busyLoad = false;
          vm.listMasterLawTdfk = rs.data;
        })
        .catch(function (err) {
          vm.busyLoad = false;
          $scope.nofityError('特記様式登録が失敗しました。' + err);
        });
      }
    }
    /**
     * save to database rules
     * @param {*} isValid check validation
     */
    vm.saveMention = function (isValid) {
      $scope.handleShowConfirm({
        message: '保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.lawRulesForm');
          return false;
        }

        vm.property.createOrUpdate()
          .then(function (res) {
            $scope.nofitySuccess('特記様式データの保存が完了しました。');
          })
          .catch(function (res) {
            $scope.nofityError('特記様式データの保存が失敗しました。' + res.data.message);
          });
      });
    };

    vm.pushMention = function () {
      vm.property.doc.mentions.push({
        clause: '',
        headline: '',
        time1_check: false,
        time2_check: false,
        final_check: false
      });
    };

    vm.removeMention = function (_item) {
      var index = vm.property.doc.mentions.indexOf(_item);
      $scope.handleShowConfirm({
        message: 'このデータを削除します。よろしいですか？'
      }, function () {
        vm.property.doc.mentions.splice(index, 1);
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
        file: '特記様式_' + vm.property.men17 + '.xls',
        text: 'ダウンロード'
      });
    };

    vm.checkParent = function (value, checked) {
      vm.property.doc.formMen_ha = $scope.checkSheetRoHa(value, checked, vm.property.doc.formMen_ha,
        vm.property.doc.formMen_ro, vm.listMasterLawTdfk, 'form1');
    };
    // controller
  }

  angular.module('properties.admin').filter('contains', function () {
    return function (array, needle) {
      if (!array) return 0;
      return array.indexOf(needle) >= 0;
    };
  });
}());
