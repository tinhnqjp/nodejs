(function () {
  'use strict';

  angular
    .module('laws.admin')
    .controller('LawsAdminController', LawsAdminController);

  LawsAdminController.$inject = ['$scope', '$state', '$window', 'lawResolve',
    'Authentication', 'Notification', 'LawsService', 'LawsApi', '$uibModal', '$sce', '$timeout'];

  function LawsAdminController($scope, $state, $window, law, Authentication,
    Notification, LawsService, LawsApi, $uibModal, $sce, $timeout) {
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
    vm.typeValidation = [
      { id: '==', name: '等しい' },
      { id: '>=', name: '以上' },
      { id: '<=', name: '以下' },
      { id: '<', name: '未満' },
      { id: '>', name: '超過' }
    ];

    vm.tmpLawDetails = [];
    vm.tmpLawRegulations = [];
    vm.listMasterProperties = [];
    initData();
    vm.busy = false;
    vm.scrollTopValue = 0;
    /**
     * is submitted ?
     */
    vm.submitted = false;
    // using in download
    vm.maxColumnRules = 0;

    /** init method */
    function initData() {
      vm.busy = true;
      LawsApi.listMasterProperties()
        .then(function (res) {
          vm.listMasterProperties = res.data;
          vm.bukken = _.uniq(vm.listMasterProperties, 'bukken');
        })
        .catch(function (res) {
          $scope.nofityError('マスターデータのロードが失敗しました。');
        });

      if (law._id) {
        LawsApi.requestRegulation(law._id)
          .then(function (res) {
            vm.todoufuken_regulations = res.data.todoufuken_regulations;
            if (vm.todoufuken_regulations.length === 0) return;
            vm.todoufuken_regulations.forEach(function (tr, key) {
              vm.tmpLawRegulations[tr._id] = [];
            });

          })
          .catch(function (res) {
            $scope.nofityError('マスターデータのロードが失敗しました。');
          });

        LawsApi.requestDetail(law._id)
          .then(function (res) {
            console.log(res.data);
            vm.tmpLawDetails = res.data.law_details;
          })
          .catch(function (res) {
            $scope.nofityError('法令データのロードが失敗しました。' + res.data.message);
          });
      }
      vm.busy = false;
    }

    /**
     * hide form law rule
     */
    function hideLawsRule() {
      vm.isVisibleLawsRule = false;
      setTimeout(function () {
        $(window).scrollTop(vm.scrollTopValue);
      }, 0);
    }

    /**
     * show form law rule
     * @param {*} _lawData lawdata
     * @param {*} _title title
     */
    function showLawsRule(_lawData, _title) {
      var windowEl = angular.element($window);
      vm.scrollTopValue = windowEl.scrollTop();

      var _lawDataId = _lawData._id;
      vm.formLawsRule.info = _lawData;
      vm.formLawsRule.info.title = _title;
      vm.isVisibleLawsRule = true;

      LawsApi.requestData(_lawData.law_id, _lawDataId)
        .then(function (res) {
          var rules = res.data.law_rules;

          var _rules = [];
          rules.forEach(function (rule, key) {
            var _fields = [];
            rule.fields.forEach(function (field, k) {
              // in database has format ("name" : "4_15_null")
              var _dataField = field.name.split('_');
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
        .catch(function (res) {
          $scope.nofityError('法令データのロードが失敗しました。' + res.data.message);
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
      _properties.forEach(function (property, k) {
        if ((property.type === 2 || property.type === 3) && property.json) {
          try {
            var json = property.json.replace(/'/g, '"');
            property.options = JSON.parse(json);
          } catch (error) {
            console.log('Error: Format json of property.' + error);
          }

        }

        // process value from dabase set to control
        property.value = '';
        if (property.type === 3 && !_.isEmpty(listValue)) {
          property.value = listValue[k].value.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
        } else if (property.type === 4 && !_.isEmpty(listValue)) {
          property = listValue[0];
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
        if (property.parent_flag === 3) {
          var parent_property = _.find(_properties, {
            parent_flag: 2
          });
          if (parent_property.value) {
            var options = _.find(property.options, {
              name: parent_property.value
            });
            _newProperties[k].child_options = options.child;
          }
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
          return item.bukken === rule_field.bukken &&
            item.daikoumoku === rule_field.deuta1 &&
            item.kokoumoku === rule_field.deuta2;
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
      rule_field.deuta1 = null;
      rule_field.deuta2 = null;
      rule_field.properties = [];
      rule_field.optionDai = createProperties(rule_field, 1);
    };

    /**
     * when select daikoumoku pulldown
     * Get options of kokoumoku pulldown or properties
     * @param {*} rule_field
     */
    vm.selectDai = function (rule_field) {
      var tmpPropertiesKo = createProperties(rule_field, 2);
      rule_field.deuta2 = null;
      rule_field.optionKo = null;
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
      var property = _.find(properties, {
        parent_flag: 3
      });
      var options = _.find(property.options, {
        name: selected
      });
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
     * copy a rule
     * @param {*} _rule current rule
     */
    vm.copyLawsRule = function (_rule) {
      var index = vm.formLawsRule.rules.indexOf(_rule);
      var number = index + 1;
      $scope.handleShowConfirm({
        message: '条件グループ' + number + 'をコピーします。よろしいですか？'
      }, function () {
        var newRule = angular.copy(_rule);
        newRule.rule_name = newRule.rule_name + ' - コピー';
        vm.formLawsRule.rules.push(newRule);
      });
    };

    /**
     * remove a rule
     * @param {*} _rule current rule
     */
    vm.removeLawsRule = function (_rule) {
      var index = vm.formLawsRule.rules.indexOf(_rule);
      var number = index + 1;
      $scope.handleShowConfirm({
        message: '条件グループ' + number + 'を削除します。よろしいですか？'
      }, function () {
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
      $scope.handleShowConfirm({
        message: 'この条件項目を削除します。よろしいですか？'
      }, function () {
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
      $scope.handleShowConfirm({
        message: '保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.lawRulesForm');
          return false;
        }
        LawsApi.postLawData(law._id, vm.formLawsRule.info._id, vm.formLawsRule.rules)
          .then(function (res) {
            $scope.nofitySuccess('条件データの保存が完了しました。');
          })
          .catch(function (res) {
            $scope.nofityError('条件データの保存が失敗しました。' + res.data.message);
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
          .then(function (res) {
            vm.tmpLawDetails = res.data.law_details;
            vm.busy = false;
          })
          .catch(function (res) {
            $scope.nofityError('法令データのロードが失敗しました。' + res.data.message);
          });
      }
    };

    /**
     * when click open collapse toudofuken 北海道...
     */
    vm.openCollapse = function (regulationId) {
      if (vm.tmpLawRegulations[regulationId].length > 0) return;
      vm.busy = true;
      var tr = _.findWhere(vm.todoufuken_regulations, {
        _id: regulationId
      });
      if (!tr || vm.tmpLawRegulations[tr._id].length > 0) return;
      vm.tmpLawRegulations[tr._id] = tr.law_regulations;
      vm.busy = false;
    };

    /**
     * save law new / edit
     * @param {*} isValid valid
     */
    function save(isValid) {
      if (!isValid) {
        vm.submitted = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.form.lawForm');
        return false;
      }
      $scope.handleShowConfirm({
        message: '保存します。よろしいですか？'
      }, function () {
        vm.busy = true;
        // Create a new law, or update the current instance
        var rs_law = new LawsService({
          _id: vm.law._id,
          year: vm.law.year,
          name: vm.law.name
        });
        rs_law.createOrUpdate()
          .then(function (res) {
            vm.busy = false;
            if (!vm.law._id) {
              console.log(res.data);
              // $state.go('admin.laws.edit', { lawId: res.data._id });
            }
            $scope.nofitySuccess('法令データの保存が完了しました。');
          })
          .catch(function (res) {
            vm.busy = false;
            $scope.nofityError('法令データの保存が失敗しました。' + res.data.message);
          });
      });
    }

    /**
     * display list checkbox
     * @param {*} property property of rule
     */
    vm.openModal = function (property) {
      // init modal
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

    /**
     * click download in 法令や都道府県
     * @param {*} isHourei true: 法令 ・false: 都道府県
     * @param {*} title title of excel export
     * @param {*} regulation_id if 都道府県
     */
    vm.download = function (isHourei, title, regulation_id) {
      vm.busy = true;
      requestDataByLawId(law._id)
        .then(function (lawDataList) {
          vm.lawDataListUpdate = lawDataList;
        })
        .then(function () {
          // 法令
          if (isHourei) {
            vm.maxColumnRules = 0;
            vm.tmpLawDetails.forEach(function (_lawData, k) {
              var newLawData = _.find(vm.lawDataListUpdate, {
                _id: _lawData._id
              });
              _lawData.law_rules = setValueForField(newLawData.law_rules);
              if (newLawData.law_rules.length > vm.maxColumnRules) {
                vm.maxColumnRules = newLawData.law_rules.length;
              }
            });
          } else {
            // 都道府県
            vm.maxColumnRules = 0;
            vm.tmpLawRegulations[regulation_id].forEach(function (_lawData, k) {
              var newLawData = _.find(vm.lawDataListUpdate, {
                _id: _lawData._id
              });
              _lawData.law_rules = setValueForField(newLawData.law_rules);
              if (newLawData.law_rules.length > vm.maxColumnRules) {
                vm.maxColumnRules = newLawData.law_rules.length;
              }
            });
          }
          // reload form
          if (!$scope.$$phase) $scope.$digest();
          return requesLawById(vm.law._id);
        })
        .then(function (requesLawNew) {
          // export excel
          var _tableId = isHourei ? 'detail_hourei' : 'regulation_' + regulation_id;
          var _file_name_first = requesLawNew.name;
          var _file_name_last = isHourei ? title : '条例 （' + title + '）';
          var href = $scope.exportExcel('#' + _tableId, 'エクスポート');
          vm.busy = false;
          $scope.handleShowDownload({
            href: href,
            file: _file_name_first + '_' + _file_name_last + '.xls',
            text: 'ダウンロード'
          });
        })
        .catch(function (err) {
          vm.busy = false;
          $scope.nofityError('法令データの保存が失敗しました。' + err);
        });
    };

    /**
     * set value 条件グループ1
     * @param {*} rules rule
     */
    function setValueForField(rules) {
      var _rules = [];
      rules.forEach(function (rule, key) {
        rule.fields.forEach(function (field, k) {
          // in database has format ("name" : "4_15_null")
          var _dataField = field.name.split('_');
          field.bukken = parseInt(_dataField[0], 10);
          field.deuta1 = parseInt(_dataField[1], 10);
          field.deuta2 = _dataField[2] ? parseInt(_dataField[2], 10) : null;
          if (field.bukken > 0 && field.deuta1 > 0) {
            var tmpPropertiesKo = _.filter(vm.listMasterProperties, function (item) {
              return item.bukken === field.bukken &&
                item.daikoumoku === field.deuta1 &&
                item.kokoumoku === field.deuta2;
            });
            if (tmpPropertiesKo) {
              field.bukken_name = tmpPropertiesKo[0].bukken_name;
              field.daikoumoku_name = tmpPropertiesKo[0].daikoumoku_name;
              field.kokoumoku_name = tmpPropertiesKo[0].kokoumoku_name;
            }
          }
        });
      });
      return rules;
    }

    /**
     * Get law data by law id
     * @param {*} _lawId law
     */
    function requestDataByLawId(_lawId) {
      return new Promise(function (resolve, reject) {
        LawsApi.requestDataByLawId(_lawId)
          .then(function (res) {
            resolve(res.data);
          })
          .catch(function (res) {
            reject(res.data.message);
          });
      });
    }

    function requesLawByLawId(_lawId) {
      return new Promise(function (resolve, reject) {
        LawsApi.requestDataByLawId(_lawId)
          .then(function (res) {
            resolve(res.data);
          })
          .catch(function (res) {
            reject(res.data.message);
          });
      });
    }
    /**
     * Get law by law id
     * @param {*} _lawId law
     */
    function requesLawById(_lawId) {
      return LawsService.get({
        lawId: _lawId
      }).$promise;
    }

    /**
     * create array from number
     * ng-repeat="i in getNumber(vm.maxColumnRules)"
     */
    $scope.getNumber = function (num) {
      var temp = [];
      for (var j = 1; j <= num; j++) {
        temp.push(j);
      }
      return temp;
    };

    /**
     * convert mark id: '==', name: '等しい'
     * @param {*} id ==
     * @returns String 等しい
     */
    $scope.getValidationByFind = function (_id) {
      return _.find(vm.typeValidation, {
        id: _id
      });
    };

    /**
     * check containts
     * @param {*} arraySource source
     * @param {*} value value
     */
    $scope.checkContains = function (arraySource, value) {
      var index = arraySource.indexOf(value);
      if (index === -1)
        return false;
      return true;
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

    /**
     * spec for master property (parent_flag = 1):
     * when click checked at checkbox parent (false)-> checkbox child auto unchecked
     * @param {*} property_p parent
     * @param {*} checked status checked
     */
    $ctrl.checkboxSelectParent = function (property_p, checked) {
      var idx = $ctrl.property.value.indexOf(property_p.name);
      if (idx >= 0 && !checked) {
        if (property_p.child) {
          $ctrl.property.value.splice(idx, 1);
          property_p.child.forEach(function (c) {
            var idc = $ctrl.property.value.indexOf(c.name);
            if (idc >= 0) {
              $ctrl.property.value.splice(idc, 1);
            }
          });
        }
      }
    };
  });

}());
