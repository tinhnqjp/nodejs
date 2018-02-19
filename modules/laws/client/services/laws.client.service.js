(function () {
  'use strict';

  angular
    .module('laws.services')
    .factory('LawsService', LawsService);

  LawsService.$inject = ['$resource', '$log'];

  function LawsService($resource, $log) {
    var Law = $resource('/api/laws/:lawId', {
      lawId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Law.prototype, {
      createOrUpdate: function () {
        var law = this;
        return createOrUpdate(law);
      }
    });

    return Law;

    function createOrUpdate(law) {
      if (law._id) {
        return law.$update(onSuccess, onError);
      } else {
        return law.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(law) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }
}());
