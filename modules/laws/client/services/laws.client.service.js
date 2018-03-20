(function () {
  'use strict';

  angular
    .module('laws.services')
    .factory('LawsService', LawsService).factory('LawsApi', LawsApi);

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

  LawsApi.$inject = ['$http'];
  function LawsApi($http) {

    this.requestDetail = lawId => {
      return $http.post('/api/laws/' + lawId + '/requestDetail', null, { ignoreLoadingBar: true });
    };
    this.requestRegulation = lawId => {
      return $http.post('/api/laws/' + lawId + '/requestRegulation', null, { ignoreLoadingBar: true });
    };
    this.requestData = (lawId, lawDataId) => {
      return $http.post('/api/laws/' + lawId + '/requestData', { id: lawDataId }, { ignoreLoadingBar: true });
    };

    this.copyLaw = (lawId) => {
      return $http.post('/api/laws/' + lawId + '/copyLaw', null, { ignoreLoadingBar: true });
    };
    this.postLawData = (lawId, lawDataId, lawRules) => {
      return $http.post('/api/laws/' + lawId + '/postLawData', { lawRules: lawRules, lawDataId: lawDataId }, { ignoreLoadingBar: true });
    };
    this.listMasterProperties = () => {
      return $http.get('/api/listMasterProperties', null, { ignoreLoadingBar: true });
    };
    return this;
  }
}());
