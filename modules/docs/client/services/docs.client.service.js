(function () {
  'use strict';

  angular
    .module('docs.services')
    .factory('DocsService', DocsService);

  DocsService.$inject = ['$resource', '$log'];

  function DocsService($resource, $log) {
    var Doc = $resource('/api/docs/:docId', {
      docId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Doc.prototype, {
      createOrUpdate: function () {
        var doc = this;
        return createOrUpdate(doc);
      }
    });

    return Doc;

    function createOrUpdate(doc) {
      if (doc._id) {
        return doc.$update(onSuccess, onError);
      } else {
        return doc.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(doc) {
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
