(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('Doc1AdminController', Doc1AdminController);

  Doc1AdminController.$inject = ['$scope', '$state', '$window', 'propertyResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'LawsApi', 'PropertyApi', '$stateParams'
  ];

  function Doc1AdminController($scope, $state, $window, property, Authentication,
    Notification, Excel, $timeout, LawsApi, PropertyApi, $stateParams) {
    var vm = this;
    vm.propertyId;
    vm.property = property;
    vm.authentication = Authentication;
    vm.listMasterLawDetail = [];
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
      LawsApi.listMasterLawDetail()
        .then(function (res) {
          vm.busyLoad = false;
          vm.listMasterLawDetail = res.data;
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
        var listCheckSheetForm4;
        var listCheckSheetForm7;
        PropertyApi.listMasterCheckSheetForm4()
          .then(function (rs) {
            listCheckSheetForm4 = rs.data;
            return PropertyApi.listMasterCheckSheetForm7();
          })
          .then(function (rs) {
            listCheckSheetForm7 = rs.data;
            vm.property.doc.form4_ro = [];
            vm.property.doc.form4_ha1 = [];
            vm.property.doc.form7_ro1 = [];
            vm.property.doc.form1_ro.forEach(function (id) {
              var filterForm4 = _.filter(listCheckSheetForm4, {
                form1: parseInt(id, 10)
              });
              filterForm4.forEach(function (form4) {
                vm.property.doc.form4_ro.push(form4.id);
                // form ha
                vm.property.doc.form4_ha1 = $scope.checkSheetRoHa(form4.id, true, vm.property.doc.form4_ha1, vm.property.doc.form4_ro, listCheckSheetForm4, 'form4');
              });
              // form7
              var filterForm7 = _.filter(listCheckSheetForm7, {
                form1: parseInt(id, 10)
              });
              filterForm7.forEach(function (form7) {
                vm.property.doc.form7_ro1.push(form7.id);
              });
            });
            vm.property.createOrUpdate()
              .then(function (res) {
                $scope.nofitySuccess('第一号様式データの保存が完了しました。');
              })
              .catch(function (res) {
                $scope.nofityError('第一号様式データの保存が失敗しました。' + res.data.message);
              });
          })
          .catch(function (err) {
            vm.busyLoad = false;
            console.log(err);
            $scope.nofityError('第一号様式データの保存が失敗しました。' + err);
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
        file: '第一号様式_' + vm.property.men17 + '.xls',
        text: 'ダウンロード'
      });
    };

    vm.checkParent = function (value, checked) {
      vm.property.doc.form1_ha = $scope.checkSheetRoHa(value, checked, vm.property.doc.form1_ha,
        vm.property.doc.form1_ro, vm.listMasterLawDetail, 'form1');
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
