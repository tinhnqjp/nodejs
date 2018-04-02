(function () {
  'use strict';

  angular
    .module('docs.admin')
    .controller('DocsAdminListController', DocsAdminListController);

  DocsAdminListController.$inject = ['PropertiesService', '$scope', '$state', '$window', 'Authentication', 'Notification'];

  function DocsAdminListController(PropertiesService, $scope, $state, $window, Authentication, Notification) {
    var vm = this;

    vm.authentication = Authentication;
    vm.form = {};
    vm.currentPage = 1;
    vm.pageSize = 10;
    getData();

    vm.pageChanged = function () {
      getData();
    };

    function getData() {
      var input = { page: vm.currentPage, limit: vm.pageSize };
      PropertiesService.get(input, function (output) {
        vm.properties = output.properties;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }
  }
}());
