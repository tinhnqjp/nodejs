(function () {
  'use strict';

  angular
    .module('laws.admin')
    .controller('LawsAdminListController', LawsAdminListController);

  LawsAdminListController.$inject = ['LawsService', '$scope', '$state', '$window', 'Authentication',
    'Notification', 'LawsApi', 'modalService', 'notifyService'];

  function LawsAdminListController(LawsService, $scope, $state, $window, Authentication, Notification,
    LawsApi, modalService, notifyService) {
    var vm = this;

    vm.currentPage = 1;
    vm.pageSize = 5;
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
      var input = { page: vm.currentPage, limit: vm.pageSize };
      LawsService.get(input, function (output) {
        vm.laws = output.laws;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    // remove law
    function remove(_law) {
      modalService.openModal('この法令を削除します。よろしいですか？').result.then(function (result) {
        vm.busy = true;
        var law = new LawsService({ _id: _law._id });
        law.$remove(function () {
          getData();
          vm.busy = false;
          notifyService.success('法令データの削除が完了しました。');
        });
      });
    }

    // copy law
    function copy(_law) {
      modalService.openModal('この法令データをコピーします。よろしいですか？').result.then(function (result) {
        vm.busy = true;
        LawsApi.copyLaw(_law._id)
          .then((res) => {
            vm.busy = false;
            getData();
            notifyService.success('法令データのコピーが完了しました。');
          })
          .catch((res) => {
            vm.busy = false;
            notifyService.error('法令データのコピーが失敗しました。');
          });
      });
    }

  // end controller
  }

}());
