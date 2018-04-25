(function () {
  'use strict';

  angular
    .module('mentions.services')
    .factory('MentionsService', MentionsService)
    .factory('MentionsApi', MentionsApi);

  MentionsService.$inject = ['$resource', '$log'];

  function MentionsService($resource, $log) {
    var Mention = $resource('/api/mentions/:mentionId', {
      mentionId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Mention.prototype, {
      createOrUpdate: function () {
        var mention = this;
        return createOrUpdate(mention);
      }
    });

    return Mention;

    function createOrUpdate(mention) {
      if (mention._id) {
        return mention.$update(onSuccess, onError);
      } else {
        return mention.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(mention) {
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

  MentionsApi.$inject = ['$http'];
  function MentionsApi($http) {

    this.copy = function (mentionId) {
      return $http.post('/api/mentions/' + mentionId + '/copy', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
