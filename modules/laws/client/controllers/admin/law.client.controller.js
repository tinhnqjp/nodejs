(function () {
  'use strict';

  angular
    .module('laws.admin')
    .controller('LawsAdminController', LawsAdminController);

  LawsAdminController.$inject = ['$scope', '$state', '$window', 'lawResolve', 'Authentication', 'Notification'];

  function LawsAdminController($scope, $state, $window, law, Authentication, Notification) {
    var vm = this;

    vm.law = law;
    vm.authentication = Authentication;
    vm.form = {};
    vm.isVisibleLawsRule = false;
    vm.hideLawsRule = hideLawsRule;
    vm.showLawsRule = showLawsRule;
    vm.formLawsRule = {};
    vm.remove = remove;
    vm.save = save;
    vm.years = [
      { id: 2020, name: '2020年' },
      { id: 2019, name: '2019年' },
      { id: 2018, name: '2018年' },
      { id: 2017, name: '2017年' },
      { id: 2016, name: '2016年' },
      { id: 2015, name: '2015年' },
      { id: 2014, name: '2014年' }
    ];

    initData();
    function initData() {
      if (law.todoufuken_regulations) {
        if (vm.law.todoufuken_regulations.length === 0) return;
        vm.law.todoufuken_regulations.forEach(tr => {
          tr.tpmList = [];
          tr.busy = false;
        });
      }
    }

    function hideLawsRule() {
      vm.isVisibleLawsRule = false;
    }

    function showLawsRule(_lawTitle) {
      vm.formLawsRule.info = _lawTitle;

      var index = vm.law.law_details.indexOf(_lawTitle);
      if (vm.law.law_details[index].rules) {
        vm.formLawsRule.rules = vm.law.law_details[index].rules;
      } else {
        vm.formLawsRule.rules = [];
      }

      vm.isVisibleLawsRule = true;
      console.log(vm.formLawsRule);
    }

    vm.pushLawsRuleField = function (_lawsRule) {
      var index = vm.formLawsRule.rules.indexOf(_lawsRule);
      vm.formLawsRule.rules[index].rule_fields.push({});
      console.log(vm.formLawsRule.rules[index]);
    };

    vm.removeLawsRuleField = function (_lawsRule, _lawsRuleField) {
      if ($window.confirm('Are you sure you want to delete?')) {
        var index = vm.formLawsRule.rules.indexOf(_lawsRule);
        var indexField = vm.formLawsRule.rules[index].rule_fields.indexOf(_lawsRuleField);
        vm.formLawsRule.rules[index].rule_fields.splice(indexField, 1);
      }
    };

    vm.classButtonLawsRule = function (rules) {
      // console.log(rules);
      // if (rules.length) {
      //   return 'btn-success';
      // }
      return 'btn-default';
    };

    // TODO
    vm.openCollapseHourei = function () {
      vm.law_details_tpm = vm.law.law_details;
    };

    vm.openCollapse = regulationId => {
      var rt = _.findWhere(vm.law.todoufuken_regulations, { _id: regulationId });

      if (!rt) return;
      rt.busy = true;
      rt.tpmList = rt.law_regulations;
      rt.busy = false;
    };

    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.law.$remove(function () {
          $state.go('admin.laws.list');
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Law deleted successfully!' });
        });
      }
    }

    // Save Law
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.lawForm');
        return false;
      }

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
}());
