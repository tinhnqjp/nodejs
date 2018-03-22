(function () {
  'use strict';

  angular
    .module('laws.services')
    .factory('modalService', modalService)
    .factory('notifyService', notifyService)
    .controller('ModalConfirmCtrl', ModalConfirmCtrl);

  function modalService($uibModal) {
    return {
      openModal: openModal
    };

    function openModal(message) {
      var actionButtonText = '決定';
      var closeButtonText = '閉じる';
      var headerText = '確認';
      var modalInstance = $uibModal.open({
        templateUrl: 'modalConfirm.html',
        controller: 'ModalConfirmCtrl',
        controllerAs: '$ctrl',
        resolve: {
          message: function () {
            return message;
          },
          headerText: function () {
            return headerText;
          },
          actionButtonText: function () {
            return actionButtonText;
          },
          closeButtonText: function () {
            return closeButtonText;
          }
        }
      });

      return modalInstance;
    }
  }

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

  function ModalConfirmCtrl($uibModalInstance, message, headerText, actionButtonText, closeButtonText) {
    var $ctrl = this;
    $ctrl.message = message;
    $ctrl.headerText = headerText;
    $ctrl.actionButtonText = actionButtonText;
    $ctrl.closeButtonText = closeButtonText;

    $ctrl.close = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $ctrl.ok = function () {
      $uibModalInstance.close('true');
    };
  }
}());
