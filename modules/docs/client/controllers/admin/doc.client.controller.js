(function () {
  'use strict';

  angular
    .module('docs.admin')
    .controller('DocsAdminController', DocsAdminController);

  DocsAdminController.$inject = ['$scope', '$state', '$window', 'docResolve', 'Authentication', 'Notification'];

  function DocsAdminController($scope, $state, $window, doc, Authentication, Notification) {
    var vm = this;

    vm.doc = doc;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.laws =
    [
      {
        '_id': '1',
        'koumaku1': '法第19条',
        'koumaku2': '法第19条 2',
        'houbun': '敷地の衛生及び安全'
      },
      {
        '_id': '2',
        'koumaku1': '法第20条',
        'koumaku2': '法第19条 2',
        'houbun': '構造耐力'
      },
      {
        '_id': '3',
        'koumaku1': '法第28条の2',
        'koumaku2': '',
        'houbun': '石綿その他の物質の飛散または発散に対する衛生上の措置'
      }
    ];

    // Remove existing Doc
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.doc.$remove(function () {
          $state.go('admin.docs.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Doc deleted successfully!' });
        });
      }
    }

    // Save Doc
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.docForm');
        return false;
      }

      console.log(vm.doc); // return;
      // Create a new doc, or update the current instance
      vm.doc.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.docs.list'); // should we send the User to the list or the updated Doc's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Doc saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Doc save error!' });
      }
    }
  }
}());
