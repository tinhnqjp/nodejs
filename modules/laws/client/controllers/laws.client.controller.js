(function () {
  'use strict';

  angular
    .module('laws')
    .controller('LawsController', LawsController);

  LawsController.$inject = ['$scope', 'lawResolve', 'Authentication'];

  function LawsController($scope, law, Authentication) {
    var vm = this;

    vm.law = law;
    vm.authentication = Authentication;

  }
}());
