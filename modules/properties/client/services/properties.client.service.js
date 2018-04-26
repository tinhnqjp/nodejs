(function () {
  'use strict';

  angular
    .module('properties.services')
    .factory('PropertiesService', PropertiesService)
    .factory('PropertyApi', PropertyApi);

  PropertiesService.$inject = ['$resource', '$log'];

  function PropertiesService($resource, $log) {

    var Property = $resource('/api/properties/:propertyId', {
      propertyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Property.prototype, {
      createOrUpdate: function () {
        var property = this;
        return createOrUpdate(property);
      }
    });
    return Property;

    function createOrUpdate(property) {
      if (property._id) {
        return property.$update(onSuccess, onError);
      } else {
        return property.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(property) {
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

  PropertyApi.$inject = ['$http'];
  function PropertyApi($http) {
    this.requestPropertyByDoc = function (doc) {
      return $http.post('/api/requestPropertyByDoc', { doc: doc }, { ignoreLoadingBar: true });
    };
    this.importPropertyFormMysql = function (ids) {
      return $http.post('/api/importPropertyFormMysql', { ids: ids }, { ignoreLoadingBar: true });
    };
    this.requestPropertiesMysql = function (input) {
      return $http.post('/api/requestPropertiesMysql', input, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
