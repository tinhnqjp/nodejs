(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('MentionsAdminController', MentionsAdminController);

  MentionsAdminController.$inject = ['$scope', '$state', '$window', 'docResolve', 'propertyResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'DocsApi', 'PropertyApi', 'LawsApi', '$stateParams'];

  function MentionsAdminController($scope, $state, $window, doc, property, Authentication,
    Notification, Excel, $timeout, DocsApi, PropertyApi, LawsApi, $stateParams) {
    var vm = this;
    vm.propertyId;
    vm.doc = doc;
    vm.property = property;
    vm.authentication = Authentication;
    vm.form = {};
    vm.listMasterLaw = [];
    vm.isTdfk = false;
    vm.property = {};
    vm.busyLoad = false;
    initData();

    function initData() {
      vm.busyLoad = true;
      vm.propertyId = $stateParams.propertyId;
      if (!vm.doc.mentions) {
        vm.doc.mentions = [];
      }
      getFormProperty(doc._id)
      .then(function (_property) {
        vm.property = _property;
        if (vm.property.men3_1_1 === '東京都') {
          vm.isTdfk = true;
          return getlistMasterLawTdfk();
        }
      })
      .then(function (_list) {
        vm.busyLoad = false;
        vm.listMasterLaw = _list;
      })
      .catch(function (err) {
        vm.busyLoad = false;
        $scope.nofityError('特記様式登録が失敗しました。' + err);
      });
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

        vm.doc.createOrUpdate()
          .then(function (res) {
            $scope.nofitySuccess('特記様式データの保存が完了しました。');
          })
          .catch(function (res) {
            $scope.nofityError('特記様式データの保存が失敗しました。' + res.data.message);
          });
      });
    };

    vm.pushMention = function () {
      vm.doc.mentions.push({
        clause: '',
        headline: '',
        time1_check: false,
        time2_check: false,
        final_check: false
      });
    };

    vm.removeMention = function (_item) {
      var index = vm.doc.mentions.indexOf(_item);
      $scope.handleShowConfirm({
        message: 'このデータを削除します。よろしいですか？'
      }, function () {
        vm.doc.mentions.splice(index, 1);
      });
    };

    function getlistMasterLawTdfk() {
      return new Promise(function (resolve, reject) {
        LawsApi.listMasterLawTdfk()
        .then(function (res) {
          resolve(res.data);
        })
        .catch(function (res) {
          reject(res.data.message);
        });
      });
    }

    function getFormProperty(doc) {
      return new Promise(function (resolve, reject) {
        PropertyApi.requestPropertyByDoc(doc)
        .then(function (res) {
          resolve(res.data);
        })
        .catch(function (res) {
          reject(res.data.message);
        });
      });
    }

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
    // controller
  }

  angular.module('properties.admin').filter('contains', function () {
    return function (array, needle) {
      if (!array) return 0;
      return array.indexOf(needle) >= 0;
    };
  });
}());
