(function () {
  'use strict';

  angular
    .module('mentions.admin')
    .controller('MentionsAdminListController', MentionsAdminListController);

  MentionsAdminListController.$inject = ['MentionsService', '$scope', '$state', '$window',
    'Authentication', 'Notification', 'MentionsApi'];

  function MentionsAdminListController(MentionsService, $scope, $state, $window
    , Authentication, Notification, MentionsApi) {
    var vm = this;

    vm.authentication = Authentication;
    vm.form = {};
    vm.mentions;
    vm.currentPage = 1;
    vm.pageSize = 10;
    getData();
    vm.pageChanged = function () {
      getData();
    };

    function getData() {
      var input = { page: vm.currentPage, limit: vm.pageSize };
      MentionsService.get(input, function (output) {
        vm.mentions = output.mentions;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    vm.remove = function (_mention) {
      $scope.handleShowConfirm({ message: 'この特記を削除します。よろしいですか？' }, function () {
        vm.busy = true;
        var mention = new MentionsService({ _id: _mention._id });
        mention.$remove(function () {
          getData();
          vm.busy = false;
          $scope.nofitySuccess('特記データの削除が完了しました。');
        });
      });
    };

    // copy mention
    vm.copy = function (_mention) {
      $scope.handleShowConfirm({ message: 'この特記データをコピーします。よろしいですか？' }, function () {
        vm.busy = true;
        MentionsApi.copy(_mention._id)
          .then(function (res) {
            vm.busy = false;
            getData();
            $scope.nofitySuccess('特記データのコピーが完了しました。');
          })
          .catch(function (res) {
            vm.busy = false;
            $scope.nofityError('特記データのコピーが失敗しました。');
          });
      });
    };
    // end controller
  }

}());
