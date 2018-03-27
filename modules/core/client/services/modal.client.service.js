(function () {
  'use strict';

  angular
    .module('core')
    .factory('notifyService', notifyService);

  function notifyService(Notification) {
    return {
      success: success,
      error: error
    };
    function success(message) {
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> ' + message });
    }

    function error(message) {
      Notification.error({ message: message, title: '<i class="glyphicon glyphicon-remove"></i> ' + message });
    }
  }

}());
