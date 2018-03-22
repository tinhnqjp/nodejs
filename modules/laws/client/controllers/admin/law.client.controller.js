(function () {
  'use strict';

  angular
    .module('laws.admin')
    .controller('LawsAdminController', LawsAdminController);

  LawsAdminController.$inject = ['$scope', '$state', '$window', 'lawResolve',
    'Authentication', 'Notification', 'LawsService', 'LawsApi', '$uibModal', '$sce', 'modalService', 'notifyService'];

  function LawsAdminController($scope, $state, $window, law, Authentication,
    Notification, LawsService, LawsApi, $uibModal, $sce, modalService, notifyService) {
    var vm = this;

    vm.law = law;
    vm.authentication = Authentication;
    vm.form = {};
    vm.isVisibleLawsRule = false;
    vm.hideLawsRule = hideLawsRule;
    vm.showLawsRule = showLawsRule;
    vm.formLawsRule = {};
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

    vm.tmpLawDetails = [];
    vm.tmpLawRegulations = [];
    vm.listMasterProperties = [];
    initData();
    vm.busy = false;
    vm.scrollTopValue = 0;

    /** init method */
    function initData() {
      vm.busy = true;
      LawsApi.listMasterProperties()
      .then((res) => {
        vm.listMasterProperties = res.data;
        vm.bukken = _.uniq(vm.listMasterProperties, 'bukken');
      })
      .catch((res) => {
        notifyService.error('マスターデータのロードが失敗しました。');
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
          notifyService.error('マスターデータのロードが失敗しました。');
        });
      }
      vm.busy = false;
    }

    /**
     * hide form law rule
     */
    function hideLawsRule() {
      vm.isVisibleLawsRule = false;
      setTimeout(function () { $(window).scrollTop(vm.scrollTopValue); }, 0);
    }

    /**
     * show form law rule
     * @param {*} _lawData lawdata
     */
    function showLawsRule(_lawData) {
      var windowEl = angular.element($window);
      vm.scrollTopValue = windowEl.scrollTop();

      var _lawDataId = _lawData._id;
      vm.formLawsRule.info = _lawData;
      vm.isVisibleLawsRule = true;

      LawsApi.requestData(_lawData.law_id, _lawDataId)
      .then((res) => {
        var rules = res.data.law_rules;
        var _rules = [];
        rules.forEach((rule, key) => {
          var _fields = [];
          rule.fields.forEach((field, k) => {
            // in database has format ("name" : "4,15,null")
            var _dataField = field.name.split(',');
            _fields[k] = {
              bukken: parseInt(_dataField[0], 10),
              deuta1: parseInt(_dataField[1], 10),
              deuta2: _dataField[2] ? parseInt(_dataField[2], 10) : ''
            };
            _fields[k].optionDai = createProperties(_fields[k], 1);
            var _properties = null;
            if (_fields[k].deuta2) {
              // has kokoumoku
              var _optionKo = createProperties(_fields[k], 2);
              _fields[k].optionKo = _.uniq(_optionKo, 'kokoumoku');
              _properties = createProperties(_fields[k], 3);
              _fields[k].properties = createListProperties(_properties, field.properties);

            } else {
              // none kokoumoku
              _fields[k].optionKo = null;
              _properties = createProperties(_fields[k], 2);
              _fields[k].properties = createListProperties(_properties, field.properties);
            }
          });
          rule.fields = _fields;
        });
        vm.formLawsRule.rules = rules;
      })
      .catch((res) => {
        notifyService.error('法令データのロードが失敗しました。' + res.data.message);
      });
    }

    vm.classProperties = function (properties) {
      if (properties.length > 1) {
        return 'col-sm-6';
      }
      return 'col-sm-12';
    };

    /**
     * create properties rule after select daikomoku or kokomoku
     * @param {*} _properties list properties
     * @param {*} listValue value from database
     */
    function createListProperties(_properties, listValue) {
      var _newProperties = [];
      _properties.forEach((property, k) => {
        if ((property.type === 2 || property.type === 3) && property.json) {
          try {
            var json = property.json.replace(/'/g, '"');
            property.options = JSON.parse(json);
          } catch (error) {
            console.log('Error: Format json of property.' + error);
          }

        } else if (property.type === 1) {
          property.html_label_s = $sce.trustAsHtml(property.label_s);
          property.html_label_e = $sce.trustAsHtml(property.label_e);
        }

        // process value from dabase set to control
        property.value = '';
        if (property.type === 3 && !_.isEmpty(listValue)) {
          property.value = listValue[k].value.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
        } else {
          if (listValue && !_.isEmpty(listValue[k])) {
            property.value = listValue[k].value ? listValue[k].value : '';
          }
        }

        _newProperties[k] = _.clone(property);

        /*
        * spec for master property:
        * display child group checkbox (parent_flag = 3) when parent_flag selectbox has value
        */
        if (property.parent_flag === 3 && property.value.length > 0) {
          var parent_property = _.find(_properties, { parent_flag: 2 });
          var options = _.find(property.options, { name: parent_property.value });
          _newProperties[k].child_options = options.child;
        }
      });
      return _newProperties;
    }

    /**
     * get list properties of pulldown rule
     * @param {*} rule_field rule field
     * @param {*} select 1 bukken 2 daikoumoku 3 kokoumoku
     */
    function createProperties(rule_field, select) {
      if (select === 1) {
        // bukken
        var tmpoptionDai = _.filter(vm.listMasterProperties, function (item) {
          return item.bukken === rule_field.bukken;
        });
        return _.uniq(tmpoptionDai, 'daikoumoku');
      } else if (select === 2) {
        // daikoumoku
        return _.filter(vm.listMasterProperties, function (item) {
          return item.bukken === rule_field.bukken && item.daikoumoku === rule_field.deuta1;
        });
      } else {
        // kokoumoku
        var tmpPropertiesKo = _.filter(vm.listMasterProperties, function (item) {
          return item.bukken === rule_field.bukken
           && item.daikoumoku === rule_field.deuta1
           && item.kokoumoku === rule_field.deuta2;
        });
        return createListProperties(tmpPropertiesKo);
      }
    }

    /**
     * when select bukken pulldown
     * Get options of daikoumoku pulldown
     * @param {*} rule_field
     */
    vm.selectBukken = function (rule_field) {
      rule_field.optionDai = createProperties(rule_field, 1);
    };

    /**
     * when select daikoumoku pulldown
     * Get options of kokoumoku pulldown or properties
     * @param {*} rule_field
     */
    vm.selectDai = function (rule_field) {
      var tmpPropertiesKo = createProperties(rule_field, 2);
      if (rule_field.deuta1 && tmpPropertiesKo[0].kokoumoku_name) {
        // has kokoumoku
        rule_field.optionKo = _.uniq(tmpPropertiesKo, 'kokoumoku');
        rule_field.properties = [];
      } else {
        // none kokoumoku
        rule_field.deuta2 = null;
        rule_field.optionKo = null;
        rule_field.properties = createListProperties(tmpPropertiesKo);
      }
    };

    /**
     * when select kokoumoku pulldown
     * Get properties
     * @param {*} rule_field
     */
    vm.selectKo = function (rule_field) {
      rule_field.properties = createProperties(rule_field, 3);
    };

    /**
     * spec for master property:
     * when change parent select (parent_flag = 2)
     * then change value of child group checkbox (parent_flag = 3)
     * Get properties
     * @param {*} selected
     */
    vm.selectPropertyParent = function (selected, properties) {
      var property = _.find(properties, { parent_flag: 3 });
      var options = _.find(property.options, { name: selected });
      property.child_options = options.child;
      property.value = [];
    };

    /**
     * pull new rule 条件追加
    */
    vm.pushLawsRule = function () {
      vm.formLawsRule.rules.push({
        rule_name: '',
        fields: []
      });
    };

    /**
     * remove a rule
     * @param {*} _rule current rule
     */
    vm.removeLawsRule = function (_rule) {
      var index = vm.formLawsRule.rules.indexOf(_rule);
      var number = index + 1;
      modalService.openModal('条件グループ' + number +'を削除します。よろしいですか？').result.then(function (result) {
        vm.formLawsRule.rules.splice(index, 1);
      });
    };

    /**
     * pull new field 物件データ項目 追加
     * @param {*} _rule current rule
     */
    vm.pushLawsRuleField = function (_rule) {
      var index = vm.formLawsRule.rules.indexOf(_rule);
      vm.formLawsRule.rules[index].fields.push({});
    };

    /**
     * remove a field
     * @param {*} _rule current rule
     * @param {*} _ruleField current field
     */
    vm.removeLawsRuleField = function (_rule, _ruleField) {
      modalService.openModal('この条件項目を削除します。よろしいですか？').result.then(function (result) {
        var index = vm.formLawsRule.rules.indexOf(_rule);
        var indexField = vm.formLawsRule.rules[index].fields.indexOf(_ruleField);
        vm.formLawsRule.rules[index].fields.splice(indexField, 1);
      });
    };

    /**
     * save to database rules
     * @param {*} isValid check validation
     */
    vm.saveRules = function (isValid) {
      modalService.openModal('保存します。よろしいですか？').result.then(function (result) {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.lawRulesForm');
          return false;
        }
        LawsApi.postLawData(law._id, vm.formLawsRule.info._id, vm.formLawsRule.rules)
        .then((res) => {
          notifyService.success('条件データの保存が完了しました。');
        })
        .catch((res) => {
          notifyService.error('条件データの保存が失敗しました。' + res.data.message);
        });
      });
    };

    /**
     * check law has rule -> change color of button 条件割当
     * @param {*} law_rules rule
     */
    vm.classButtonLawsRule = function (law_rules) {
      if (law_rules.length) {
        return 'btn-success';
      }
      return 'btn-default';
    };

    /**
     * when click open collapse detail 法令
    */
    vm.openCollapseHourei = function () {
      if (vm.tmpLawDetails.length === 0) {
        vm.busy = true;
        LawsApi.requestDetail(law._id)
        .then((res) => {
          vm.tmpLawDetails = res.data.law_details;
          vm.busy = false;
        })
        .catch((res) => {
          notifyService.error('法令データのロードが失敗しました。' + res.data.message);
        });
      }
    };

    /**
     * when click open collapse toudofuken 北海道...
    */
    vm.openCollapse = regulationId => {
      if (vm.tmpLawRegulations[regulationId].length > 0) return;
      vm.busy = true;
      var tr = _.findWhere(vm.todoufuken_regulations, { _id: regulationId });
      if (!tr || vm.tmpLawRegulations[tr._id].length > 0) return;
      vm.tmpLawRegulations[tr._id] = tr.law_regulations;
      vm.busy = false;
    };

    // Save Law
    function save(isValid) {
      modalService.openModal('保存します。よろしいですか？').result.then(function (result) {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.lawForm');
          return false;
        }
        vm.busy = true;
        // Create a new law, or update the current instance
        var rs_law = new LawsService({ _id: vm.law._id, year: vm.law.year, name: vm.law.name });
        rs_law.createOrUpdate()
          .then((res) => {
            vm.busy = false;
            notifyService.success('法令データの保存が完了しました。');
          })
          .catch((res) => {
            vm.busy = false;
            notifyService.error('法令データの保存が失敗しました。' + res.data.message);
          });
      });
    }
    /**
     * display list checkbox
     * @param {*} property property of rule
     */
    vm.openModal = function (property) {
      var modalInstance = $uibModal.open({
        animation: true,
        ariaLabelledBy: 'modal-title',
        ariaDescribedBy: 'modal-body',
        templateUrl: 'myModalContent.html',
        controller: 'ModalInstanceCtrl',
        controllerAs: '$ctrl',
        resolve: {
          property: function () {
            return property;
          }
        }
      });
    };
  }

  /**
   * controller display modal
   */
  angular.module('laws.admin').controller('ModalInstanceCtrl', function ($uibModalInstance, property) {
    var $ctrl = this;
    $ctrl.property = property;

    /**
     * when click button 決定 in modal
     * @param {*} selectedItems selected
     */
    $ctrl.ok = function (selectedItems) {
      $uibModalInstance.close(selectedItems);
    };

    /**
     * when click button 閉じる in modal
    */
    $ctrl.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    /**
     * spec for master property (parent_flag = 1):
     * when click checked at checkbox child -> checkbox parent auto checked
     * @param {*} property_p parent
     * @param {*} property_c child
     * @param {*} checked status checked
     */
    $ctrl.checkboxSelectChild = function (property_p, property_c, checked) {
      if (!$ctrl.property.value) {
        $ctrl.property.value = [];
      }
      var idx = $ctrl.property.value.indexOf(property_p.name);
      if (idx < 0 && checked) {
        $ctrl.property.value.push(property_p.name);
        $ctrl.property.value.push(property_c.name);
      }
    };
  });


}());
