(function () {
  'use strict';

  angular
    .module('docs')
    .controller('DocsListController', DocsListController);

  DocsListController.$inject = ['DocsService'];

  function DocsListController(DocsService) {
    var vm = this;

    vm.docs = DocsService.query();
  }
}());
