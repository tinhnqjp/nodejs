(function () {
  'use strict';

  angular
    .module('laws.admin')
    .controller('LawsAdminController', LawsAdminController);

  LawsAdminController.$inject = ['$scope', '$state', '$window', 'lawResolve', 'Authentication', 'Notification', 'LawsService', 'LawsApi'];

  function LawsAdminController($scope, $state, $window, law, Authentication, Notification, LawsService, LawsApi) {
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

    vm.bukken = [
      { id: '3', name: '第三面' },
      { id: '4', name: '第四面' }
    ];
    vm.daikoumoku = [
      { id: '1', name: '1.地名地番' },
      { id: '2', name: '2.住居表示' },
      { id: '3', name: '3.都市計画区域及び準都市計画区域の内外の別等' },
      { id: '4', name: '4.防火地域' },
      { id: '5', name: '5.その他の区域、地域、地区又は街区' },
      { id: '6', name: '6.道路' },
      { id: '7', name: '7.敷地面積' }
    ];
    vm.kokoumoku = [
      { id: '1', name: '1.都市計画区域内' },
      { id: '2', name: '2.市街化区域' },
      { id: '3', name: '3.市街化調整区域' },
      { id: '4', name: '4.区域区分非設定' },
      { id: '5', name: '5.準都市計画区域内' },
      { id: '6', name: '6.都市計画区域及び準都市計画区域外' }
    ];
    vm.ruleProperties = [
      { type: '1', key: '3,7,5', value: '' },
      { type: '1', key: '3,6,', value: '' },
      { type: '1', key: '3,3,', value: '' }
    ];
    vm.tmpLawDetails = [];
    vm.tmpLawRegulations = [];

    initData();
    function initData() {
      if (law._id) {
        LawsApi.requestRegulation(law._id)
        .then((res) => {
          vm.todoufuken_regulations = res.data.todoufuken_regulations;
          if (vm.todoufuken_regulations.length === 0) return;
          vm.todoufuken_regulations.forEach((tr, key) => {
            vm.tmpLawRegulations[tr._id] = [];
          });

        })
        .catch((res) => {
          Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law save error!' });
        });
      }

      var law_id = '5a9e5e6de3fcbf1558c1e6e5';
      var _lawDataId = '5a9e5e6de3fcbf1558c1e6e6';
      LawsApi.requestData(law_id, _lawDataId)
      .then((res) => {
        var rules = res.data.law_rules;
        var _rules = [];
        rules.forEach((rule, key) => {
          var _fields  = [];
          rule.fields.forEach((field, k) => {
            var _dataField = field.name.split(',');
            _fields[k] = {
              bukken: _dataField[0],
              deuta1: _dataField[1],
              deuta2: _dataField[2],
              atai: field.value,
              type: field.type,
            };
          });
          rule.fields =_fields;
        });
      })
      .catch((res) => {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law save error!' });
      });
    }

    function hideLawsRule() {
      vm.isVisibleLawsRule = false;
    }

    function showLawsRule(_lawData) {
      var _lawDataId = _lawData._id;
      vm.formLawsRule.info = _lawData;
      vm.isVisibleLawsRule = true;

      LawsApi.requestData(_lawData.law_id, _lawDataId)
      .then((res) => {
        var rules = res.data.law_rules;
        var _rules = [];
        rules.forEach((rule, key) => {
          var _fields  = [];
          rule.fields.forEach((field, k) => {
            var _dataField = field.name.split(',');
            _fields[k] = {
              bukken: _dataField[0],
              deuta1: _dataField[1],
              deuta2: _dataField[2],
              atai: field.value,
              type: field.type,
            };
          });
          rule.fields =_fields;
        });

        vm.formLawsRule.rules = rules;
      })
      .catch((res) => {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law save error!' });
      });
    }

    vm.pushLawsRule = function () {
      vm.formLawsRule.rules.push({
        rule_name: 'rule 1',
        fields: []
      });
    };

    vm.removeLawsRule = function (_rule) {
      var index = vm.formLawsRule.rules.indexOf(_rule);
      vm.formLawsRule.rules.splice(index, 1);
    };

    vm.pushLawsRuleField = function (_rule) {
      var index = vm.formLawsRule.rules.indexOf(_rule);
      vm.formLawsRule.rules[index].fields.push({});
    };

    vm.removeLawsRuleField = function (_rule, _ruleField) {
      var index = vm.formLawsRule.rules.indexOf(_rule);
      var indexField = vm.formLawsRule.rules[index].fields.indexOf(_ruleField);
      vm.formLawsRule.rules[index].fields.splice(indexField, 1);
    };

    vm.saveRules = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.lawRulesForm');
        return false;
      }
      
      LawsApi.postLawData(law._id, vm.formLawsRule.info._id, vm.formLawsRule.rules)
      .then((res) => {
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Rule saved successfully!' });
      })
      .catch((res) => {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law save error!' });
      });
    };

    vm.classButtonLawsRule = function (law_rules) {
      if (law_rules.length) {
        return 'btn-success';
      }
      return 'btn-default';
    };

    // TODO
    vm.openCollapseHourei = function () {
      if (vm.tmpLawDetails.length === 0) {
        LawsApi.requestDetail(law._id)
        .then((res) => {
          vm.tmpLawDetails = res.data.law_details;
        })
        .catch((res) => {
          Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law save error!' });
        });
      }
    };

    vm.openCollapse = regulationId => {
      var tr = _.findWhere(vm.todoufuken_regulations, { _id: regulationId });
      if (!tr || vm.tmpLawRegulations[tr._id].length > 0) return;
      vm.tmpLawRegulations[tr._id] = tr.law_regulations;
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
      var rs_law = new LawsService({ _id: vm.law._id, year: vm.law.year, name: vm.law.name });
      rs_law.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.laws.list');
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Law saved successfully!' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law save error!' });
      }
    }
  }
}());
