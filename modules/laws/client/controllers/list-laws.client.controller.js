(function () {
  'use strict';

  angular
    .module('laws')
    .controller('LawsListController', LawsListController);

  LawsListController.$inject = ['LawsService'];

  function LawsListController(LawsService) {
    var vm = this;

    vm.laws = LawsService.query();
  }
}());
