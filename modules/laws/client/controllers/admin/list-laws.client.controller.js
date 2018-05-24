(function () {
  'use strict';

  angular
    .module('laws.admin')
    .controller('LawsAdminListController', LawsAdminListController);

  LawsAdminListController.$inject = ['LawsService', '$scope', '$state', '$window', 'Authentication',
    'Notification', 'LawsApi'
  ];

  function LawsAdminListController(LawsService, $scope, $state, $window, Authentication, Notification,
    LawsApi) {
    var vm = this;

    vm.currentPage = 1;
    vm.pageSize = 10;
    getData();

    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.copy = copy;
    vm.busy = false;

    vm.pageChanged = function () {
      getData();
    };

    // get data
    function getData() {
      var input = {
        page: vm.currentPage,
        limit: vm.pageSize
      };
      LawsService.get(input, function (output) {
        vm.laws = output.laws;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    // remove law
    function remove(_law) {
      $scope.handleShowConfirm({
        message: 'この法令を削除します。よろしいですか？'
      }, function () {
        vm.busy = true;
        var law = new LawsService({
          _id: _law._id
        });
        law.$remove(function () {
          getData();
          vm.busy = false;
          $scope.nofitySuccess('法令データの削除が完了しました。');
        });
      });
    }

    // copy law
    function copy(_law) {
      $scope.handleShowConfirm({
        message: 'この法令データをコピーします。よろしいですか？'
      }, function () {
        vm.busy = true;
        LawsApi.copyLaw(_law._id)
          .then(function (res) {
            vm.busy = false;
            getData();
            $scope.nofitySuccess('法令データのコピーが完了しました。');
          })
          .catch(function (res) {
            vm.busy = false;
            $scope.nofityError('法令データのコピーが失敗しました。');
          });
      });
    }

    // end controller
  }

}());
