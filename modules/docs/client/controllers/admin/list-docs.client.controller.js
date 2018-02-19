(function () {
  'use strict';

  angular
    .module('docs.admin')
    .filter('pagination', DocsAdminListFilter)
    .controller('DocsAdminListController', DocsAdminListController);

  DocsAdminListController.$inject = ['DocsService', '$scope', '$state', '$window', 'Authentication', 'Notification'];

  function DocsAdminListController(DocsService, $scope, $state, $window, Authentication, Notification) {
    var vm = this;

    vm.docs = DocsService.query();
    // vm.pageSize = 10;

    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.copy = copy;

    // remove doc
    function remove(_doc) {
      if ($window.confirm('Are you sure you want to delete?')) {
        var removeCallback = function () {
          vm.docs = DocsService.query();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Doc deleted successfully!' });
        };
        _doc.$remove(removeCallback);
      }
    }

    // copy doc
    function copy(_doc) {
      if ($window.confirm('Are you sure you want to copy?')) {
        var successCallback = function (res) {
          vm.docs = DocsService.query();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Doc copy successfully!' });
        };
        var errorCallback = function (res) {
          Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Doc copy error!' });
        };
        _doc._id = null;
        _doc.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);
      }
    }
  }

  function DocsAdminListFilter($filter) {
    return function (data, start) {
      return data.slice(start);
    };
  }
}());
