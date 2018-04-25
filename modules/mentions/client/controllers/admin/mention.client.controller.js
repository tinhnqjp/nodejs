(function () {
  'use strict';

  angular
    .module('mentions.admin')
    .controller('MentionsAdminController', MentionsAdminController);

  MentionsAdminController.$inject = ['$scope', '$state', '$window', 'mentionResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'MentionsApi', 'LawsApi', 'PropertyApi'
  ];

  function MentionsAdminController($scope, $state, $window, mention, Authentication,
    Notification, Excel, $timeout, MentionsApi) {
    var vm = this;

    vm.mention = mention;
    vm.authentication = Authentication;
    vm.listMentions = [];
    vm.form = {};
    initData();

    /**
     * init method
     */
    function initData() {
      // load list data masterlaw
      // LawsApi.listMasterLaw()
      //   .then(function (res) {
      //     vm.listMasterLaw = res.data;
      //   })
      //   .catch(function (res) {
      //     $scope.nofityError('マスターデータのロードが失敗しました。');
      //   });
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

        vm.mention.createOrUpdate()
          .then(function (res) {
            $scope.nofitySuccess('第一号様式データの保存が完了しました。');
          })
          .catch(function (res) {
            $scope.nofityError('第一号様式データの保存が失敗しました。' + res.data.message);
          });
      });
    };

    vm.pushMention = function () {
      if (!vm.mention.contents) {
        vm.mention.contents = [];
      }

      vm.mention.contents.push({
        clause: '',
        headline: '',
        time1_check: false,
        time2_check: false,
        final_check: false
      });
    };

    vm.removeMention = function (_item) {
      var index = vm.mention.contents.indexOf(_item);
      $scope.handleShowConfirm({
        message: 'このデータを削除します。よろしいですか？'
      }, function () {
        vm.mention.contents.splice(index, 1);
      });
    };
  }
}());
