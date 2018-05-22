(function () {
  'use strict';

  angular.module('core')
    .directive('pageTitle', pageTitle);

  pageTitle.$inject = ['$rootScope', '$interpolate', '$state'];

  function pageTitle($rootScope, $interpolate, $state) {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {
      $rootScope.$on('$stateChangeSuccess', listener);

      function listener(event, toState) {
        var applicationCoreTitle = '建築確認審査システム',
          separator = ' - ',
          stateTitle = applicationCoreTitle + separator;

        if (toState.data && toState.data.pageTitle) {
          stateTitle = $interpolate(stateTitle + toState.data.pageTitle + separator)(($state.$current.locals.globals));
        }
        stateTitle = stateTitle.slice(0, 0 - separator.length);
        element.text(stateTitle);
      }
    }
  }
}());
