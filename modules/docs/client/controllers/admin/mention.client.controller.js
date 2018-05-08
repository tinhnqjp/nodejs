(function () {
  'use strict';

  angular
    .module('docs.admin')
    .controller('MentionsAdminController', MentionsAdminController);

  MentionsAdminController.$inject = ['$scope', '$state', '$window', 'docResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'DocsApi', 'PropertyApi'
  ];

  function MentionsAdminController($scope, $state, $window, doc, Authentication,
    Notification, Excel, $timeout, DocsApi) {
    var vm = this;
    vm.doc = doc;
    vm.authentication = Authentication;
    vm.form = {};
    getData();

    function getData() {
      if (!vm.doc.mentions) {
        vm.doc.mentions = [];
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

        vm.doc.createOrUpdate()
          .then(function (res) {
            $scope.nofitySuccess('第一号様式データの保存が完了しました。');
          })
          .catch(function (res) {
            $scope.nofityError('第一号様式データの保存が失敗しました。' + res.data.message);
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
  }
}());
