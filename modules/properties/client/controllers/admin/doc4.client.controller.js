(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('Doc4AdminController', Doc4AdminController);

  Doc4AdminController.$inject = ['$scope', '$state', '$window', 'propertyResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'LawsApi', 'PropertyApi', '$stateParams'];

  function Doc4AdminController($scope, $state, $window, property, Authentication,
    Notification, Excel, $timeout, LawsApi, PropertyApi, $stateParams) {
    var vm = this;
    vm.propertyId;
    vm.property = property;
    vm.authentication = Authentication;
    vm.listMasterCheckSheetForm4 = [];
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
      PropertyApi.listMasterCheckSheetForm4()
        .then(function (res) {
          vm.busyLoad = false;
          vm.listMasterCheckSheetForm4 = res.data;
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
      console.log(vm.property.doc);
      $scope.handleShowConfirm({
        message: '保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.docForm');
          return false;
        }
        vm.property.createOrUpdate()
          .then(function (res) {
            $scope.nofitySuccess('第四号様式データの保存が完了しました。');
          })
          .catch(function (res) {
            $scope.nofityError('第四号様式データの保存が失敗しました。' + res.data.message);
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
    vm.checkha = function (id) {
      console.log(id);
    };
    vm.checkParent = function (id) {
      if (!vm.property.doc.form4_ha1) {
        vm.property.doc.form4_ha1 = [];
      }
      vm.property.doc.form4_ro.forEach(function (value) {
        if (value === id) {
          var obj = _.find(vm.listMasterCheckSheetForm4, { id: value });
          if (obj.rowspan_ck_ha1 === 0) {
            vm.property.doc.form4_ha1.push(id);
          } else {
            var i = value;
            var ck_ha1 = 0;
            while (ck_ha1 <= 0) {
              obj = _.find(vm.listMasterCheckSheetForm4, { id: i + '' });
              ck_ha1 = parseInt(obj.rowspan_ck_ha1);
              if (ck_ha1 > 0) {
                vm.property.doc.form4_ha1.push(i);
              } else {
                i = i - 1;
              }
            }
          }
        }
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
