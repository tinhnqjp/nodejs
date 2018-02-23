(function () {
  'use strict';

  angular
    .module('docs.admin')
    .controller('DocsAdminListController', DocsAdminListController);

  DocsAdminListController.$inject = ['DocsService', '$scope', '$state', '$window', 'Authentication', 'Notification'];

  function DocsAdminListController(DocsService, $scope, $state, $window, Authentication, Notification) {
    var vm = this;

    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.copy = copy;
    vm.currentPage = 1;
    vm.pageSize = 5;
    getData();

    vm.pageChanged = function () {
      getData();
    };

    function getData() {
       var input = { page: vm.currentPage, limit: vm.pageSize };
      DocsService.get(input, function (output) {
        vm.docs = output.docs;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    // remove doc
    function remove(_doc) {
      if ($window.confirm('Are you sure you want to delete?')) {
        var removeCallback = function () {
          getData();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Doc deleted successfully!' });
        };
        var doc = new DocsService({ _id: _doc._id });
        doc.$remove(removeCallback);
      }
    }

    // copy doc
    function copy(_doc) {
      if ($window.confirm('Are you sure you want to copy?')) {
        var successCallback = function (res) {
          getData();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Doc copy successfully!' });
        };
        var errorCallback = function (res) {
          Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Doc copy error!' });
        };

        var doc = new DocsService(_doc);
        doc._id = null;
        doc.createOrUpdate()
          .then(successCallback)
          .catch(errorCallback);
      }
    }
  }
}());
