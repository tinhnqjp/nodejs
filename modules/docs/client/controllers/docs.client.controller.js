(function () {
  'use strict';

  angular
    .module('docs')
    .controller('DocsController', DocsController);

  DocsController.$inject = ['$scope', 'docResolve', 'Authentication'];

  function DocsController($scope, doc, Authentication) {
    var vm = this;

    vm.doc = doc;
    vm.authentication = Authentication;

  }
}());
