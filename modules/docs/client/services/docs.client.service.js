(function () {
  'use strict';

  angular
    .module('docs.services')
    .factory('DocsService', DocsService)
    .factory('DocsApi', DocsApi);

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

  DocsApi.$inject = ['$http'];
  function DocsApi($http) {

    this.autoChecked = function (docId) {
      return $http.post('/api/docs/' + docId + '/autoChecked', null, { ignoreLoadingBar: true });
    };
    this.listMasterCheckSheetForm4 = function () {
      return $http.get('/api/listMasterCheckSheetForm4', null, { ignoreLoadingBar: true });
    };
    this.listMasterCheckSheetForm7 = function () {
      return $http.get('/api/listMasterCheckSheetForm7', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
