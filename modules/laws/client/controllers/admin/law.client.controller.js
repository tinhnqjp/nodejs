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

    vm.ruleProperties = [
      { type: '1', key: '3,7,5', value: '' },
      { type: '1', key: '3,6,', value: '' },
      { type: '1', key: '3,3,', value: '' }
    ];
    vm.tmpLawDetails = [];
    vm.tmpLawRegulations = [];
    vm.listMasterProperties = [];

    initData();
    function initData() {
      LawsApi.listMasterProperties()
      .then((res) => {
        vm.listMasterProperties = res.data;
        vm.bukken = _.uniq(vm.listMasterProperties, 'bukken');
      })
      .catch((res) => {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Law save error!' });
      });

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

    vm.selectBukken = function (rule_field) {
      var tmpoptionDai = _.filter(vm.listMasterProperties, function(item) {
        return item.bukken === rule_field.bukken;
      });
      rule_field.optionDai =_.uniq(tmpoptionDai, 'daikoumoku');
    }

    function createProperties(_propertiesKo) {
      var _properties = [];
      _propertiesKo.forEach((property, k) => {
        if ((property.type === 2 || property.type === 3) && property.list) {
          property.options = property.list.split(',');
        }
        _properties[k] = property;
      });
      return _properties;
    }

    vm.selectDai = function (rule_field) {
      console.log('select dai', rule_field.bukken, rule_field.deuta1);
      var tmpPropertiesKo = _.filter(vm.listMasterProperties, function(item) {
        return item.bukken === rule_field.bukken && item.daikoumoku === rule_field.deuta1;
      });
      if (rule_field.deuta1 && tmpPropertiesKo[0].kokoumoku_name) {
        rule_field.optionKo =_.uniq(tmpPropertiesKo, 'kokoumoku'); 
        console.log(rule_field.optionKo);
        rule_field.properties = [];
      } else {
        rule_field.deuta2 = null;
        rule_field.optionKo = null;
        
        rule_field.properties = createProperties(tmpPropertiesKo);
      }
    }

    vm.selectKo = function (rule_field) {
      console.log('select dai', rule_field.bukken, rule_field.deuta1, rule_field.deuta2);
      var tmpPropertiesKo = _.filter(vm.listMasterProperties, function(item) {
        return item.bukken === rule_field.bukken
         && item.daikoumoku === rule_field.deuta1
         && item.kokoumoku === rule_field.deuta2;
      });
      console.log(tmpPropertiesKo);
      rule_field.properties = createProperties(tmpPropertiesKo);
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
      console.log(vm.formLawsRule.rules);
      
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
