(function () {
  'use strict';

  angular
    .module('properties.services')
    .factory('PropertiesService', PropertiesService);

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
}());
