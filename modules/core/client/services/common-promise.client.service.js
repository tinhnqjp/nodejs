(function () {
  'use strict';

  // Create the common promise service
  angular
    .module('core')
    .factory('CommonPromiseService', CommonPromiseService);

  CommonPromiseService.$inject = ['$http', 'LawsApi'];

  function CommonPromiseService($http, LawsApi) {
    this.getLawsByYear = function (year) {
      return new Promise(function (resolve, reject) {
        // console.log('year', year);
        LawsApi.listLawsByYear(year)
          .success(function (res) {
            if (!res) {
              reject('法令情報が見つかりません');
            }
            resolve(res);
          })
          .error(function (res) {
            reject(res.message);
          });
      });
    };
    return this;
  }


}());
