(function () {
  'use strict';

  angular
    .module('laws.admin')
    .filter('pagination', LawsAdminListFilter)
    .controller('LawsAdminListController', LawsAdminListController);

  LawsAdminListController.$inject = ['LawsService', '$scope', '$state', '$window', 'Authentication', 'Notification'];

  function LawsAdminListController(LawsService, $scope, $state, $window, Authentication, Notification) {
    var vm = this;

    vm.currentPage = 1;
    vm.pageSize = 5;
    getData();

    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.copy = copy;

    vm.pageChanged = function () {
      getData();
    };

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
      if ($window.confirm('Are you sure you want to delete?')) {
        var law = new LawsService({ _id: _law._id });
        law.$remove(function () {
          getData();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Law deleted successfully!' });
        });
      }
    }

    function successCallback(res) {
      getData();
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Law copy successfully!' });
    }

    function errorCallback(res) {
      Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law copy error!' });
    }

    // copy law
    function copy(_law) {
      if ($window.confirm('Are you sure you want to copy?')) {
        var law = new LawsService(_law);
        law._id = null;
        law.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);
      }
    }
  }

  function LawsAdminListFilter($filter) {
    return function (data, start) {
      return data.slice(start);
    };
  }
}());
