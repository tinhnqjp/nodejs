(function () {
  'use strict';

  angular
    .module('laws.admin')
    .filter('pagination', LawsAdminListFilter)
    .controller('LawsAdminListController', LawsAdminListController);

  LawsAdminListController.$inject = ['LawsService', '$scope', '$state', '$window', 'Authentication', 'Notification'];

  function LawsAdminListController(LawsService, $scope, $state, $window, Authentication, Notification) {
    var vm = this;

    vm.laws = LawsService.query();
    vm.pageSize = 5;
    vm.currentPage = 3;

    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.copy = copy;

    vm.setPage = function (pageNo) {
      vm.currentPage = pageNo;
    };
  
    vm.pageChanged = function() {
      console.log('Page changed to: ' + vm.currentPage);
    };

    // remove law
    function remove(_law) {
      if ($window.confirm('Are you sure you want to delete?')) {
        _law.$remove( function() {
          vm.laws = LawsService.query();
          
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Law deleted successfully!' });
        });
      }
    }

    // copy law
    function copy(_law) {
      if ($window.confirm('Are you sure you want to copy?')) {
        _law._id = null;
        _law.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);

        function successCallback(res) {
          vm.laws = LawsService.query();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Law copy successfully!' });
        }
        function errorCallback(res) {
          Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law copy error!' });
        }
      }
    }
  }

  function LawsAdminListFilter($filter) {
    return function (data, start) {
      return data.slice(start);
    };
  }
}());
