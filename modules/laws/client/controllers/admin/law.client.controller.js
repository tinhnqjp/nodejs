(function () {
  'use strict';

  angular
    .module('laws.admin')
    .controller('LawsAdminController', LawsAdminController)
    .directive('contenteditable', ContenteditableDirective);

  LawsAdminController.$inject = ['$scope', '$state', '$window', 'lawResolve', 'Authentication', 'Notification'];

  function LawsAdminController($scope, $state, $window, law, Authentication, Notification) {
    var vm = this;

    vm.law = law;
    vm.authentication = Authentication;
    vm.form = {};
    vm.remove = remove;
    vm.removeLawsTitle = removeLawsTitle;
    vm.save = save;
    vm.laws =
    [
      {
        '_id': '1',
        'koumoku1': '法第19条',
        'koumoku2': '法第19条 2',
        'houbun': '敷地の衛生及び安全',
        'sort': 1
      },
      {
        '_id': '2',
        'koumoku1': '法第20条',
        'koumoku2': '法第19条 2',
        'houbun': '構造耐力',
        'sort': 2
      },
      {
        '_id': '3',
        'koumoku1': '法第28条の2',
        'koumoku2': '',
        'houbun': '石綿その他の物質の飛散または発散に対する衛生上の措置',
        'sort': 3
      }
    ];

    var fixHelper = function (e, ui) {
      ui.children().each(function () {
        console.log(e);
        $(this).width($(this).width());
      });
      return ui;
    };

    vm.sortableOptions = {
      'ui-floating': true,
      cancel: 'input,textarea,button,select,option,[contenteditable]',
      stop: function (e, ui) {
        // this callback has the changed model
        var index = 0;
        var updateLaws = vm.law.laws_titles.map(function (lawsTitle) {
          index++;
          lawsTitle.sort = index;

          return lawsTitle;
        });
      },
      helper: fixHelper
    };

    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.law.$remove(function () {
          $state.go('admin.laws.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Law deleted successfully!' });
        });
      }
    }

    // Remove existing Law
    function removeLawsTitle(_lawsTitle) {
      if ($window.confirm('Are you sure you want to delete?')) {
        var index = vm.law.laws_titles.indexOf(_lawsTitle);
        vm.law.laws_titles.splice(index, 1);
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Laws title deleted successfully!' });
      }
    }

    // Save Law
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.lawForm');
        return false;
      }

      console.log(vm.law.laws_titles); // return;
      // Create a new law, or update the current instance
      vm.law.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.laws.list'); // should we send the User to the list or the updated Law's view?
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Law saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law save error!' });
      }
    }
  }

  function ContenteditableDirective() {
    return {
      require: '?ngModel',
      link: function (scope, element, attrs, ctrl) {
        // Do nothing if this is not bound to a model
        if (!ctrl) { return; }
        // view -> model
        element.bind('input enterKey', function () {
          var rerender = false;
          var html = element.html();

          if (attrs.noLineBreaks) {
            html = html.replace(/<div>/g, '').replace(/<br>/g, '').replace(/<\/div>/g, '');
            rerender = true;
          }

          scope.$apply(function () {
            ctrl.$setViewValue(html);
            if (rerender) {
              ctrl.$render();
            }
          });
        });

        element.keyup(function (e) {
          if (e.keyCode === 13) {
            element.trigger('enterKey');
          }
        });

        // model -> view
        ctrl.$render = function () {
          element.html(ctrl.$viewValue);
        };

        // load init value from DOM
        ctrl.$render();
      }
    };
  }
}());
