(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('PropertiesAdminController', PropertiesAdminController);

  PropertiesAdminController.$inject = ['$scope', '$state', '$window', 'propertyResolve', 'Authentication',
    'Notification', 'PropertiesService', 'LawsApi', 'PropertyApi', 'AutoCheckService'
  ];

  function PropertiesAdminController($scope, $state, $window, property, Authentication, Notification,
    PropertiesService, LawsApi, PropertyApi, AutoCheckService) {
    var vm = this;

    vm.property = property;
    vm.authentication = Authentication;
    vm.form = {};
    vm.save = save;
    vm.submitted = false;
    vm.listMasterProperties = [];
    // form 3
    vm.data_men3_1;
    vm.data_men3_3;
    vm.data_men3_4;
    vm.data_men3_5_1;
    vm.data_men3_5_2;
    vm.data_men3_5_3;
    vm.data_men3_7_2;
    vm.data_men3_8;
    vm.data_men3_9;
    vm.data_men3_14;
    vm.data_men3_13_5 = ['鉄骨鉄筋コンクリート造', '鉄筋コンクリート造', '鉄骨造', '補強コンクリートブロック造', '組積造', '木造'];
    vm.data_men3_13_7 = ['道路高さ制限不適用', '隣地高さ制限不適用', '北側高さ制限不適用'];
    // form 4
    vm.data_men4_2;
    vm.data_men4_2_c1;
    vm.data_men4_2_c2;
    vm.data_men4_2_c3;
    vm.data_men4_3 = ['新築', '増築', '改築', '移転', '用途変更', '大規模の修繕', '大規模の模様替'];
    vm.data_men4_4;
    vm.data_men4_5;
    vm.data_men4_8;
    vm.data_men4_9_5 = ['建築基準法施行令第136条の2の11第1号イ', '建築基準法施行令第136条の2の11第1号ロ'];
    vm.data_men4_10;
    vm.data_men4_15;

    vm.goukei3_7 = goukei3_7;
    vm.goukei3_10 = goukei3_10;
    vm.goukei3_11 = goukei3_11;
    vm.goukei_4_10 = goukei_4_10;
    vm.selectParent3_8 = selectParent3_8;
    vm.selectParent4_2 = selectParent4_2;
    vm.busyLoad = false;
    initData();

    /**
     * init
     */
    function initData() {
      // convert to date
      if (vm.property.men10) {
        vm.property.men10 = new Date(vm.property.men10);
      }
      if (vm.property.men16) {
        vm.property.men16 = new Date(vm.property.men16);
      }
      if (vm.property.men3_15) {
        vm.property.men3_15 = new Date(vm.property.men3_15);
      }
      if (vm.property.men3_16) {
        vm.property.men3_16 = new Date(vm.property.men3_16);
      }
      if (vm.property.men3_17) {
        if (vm.property.men3_17.c1.date) {
          vm.property.men3_17.c1.date = new Date(vm.property.men3_17.c1.date);
        }
        if (vm.property.men3_17.c2.date) {
          vm.property.men3_17.c2.date = new Date(vm.property.men3_17.c2.date);
        }
        if (vm.property.men3_17.c3.date) {
          vm.property.men3_17.c3.date = new Date(vm.property.men3_17.c3.date);
        }
        if (vm.property.men3_17.c4.date) {
          vm.property.men3_17.c4.date = new Date(vm.property.men3_17.c4.date);
        }
        if (vm.property.men3_17.c5.date) {
          vm.property.men3_17.c5.date = new Date(vm.property.men3_17.c5.date);
        }
        if (vm.property.men3_17.c6.date) {
          vm.property.men3_17.c6.date = new Date(vm.property.men3_17.c6.date);
        }
      }

      vm.property.men3_7_5_1 = vm.property.men3_7_1_1 + vm.property.men3_7_1_2 + vm.property.men3_7_1_3 + vm.property.men3_7_1_4;
      // get data from master properties
      LawsApi.listMasterProperties()
        .then(function (res) {
          vm.listMasterProperties = res.data;
          vm.data_men3_1 = getOptionsFormMaster(3, 1, 1);
          vm.data_men3_3 = getOptionsFormMaster(3, 3);
          vm.data_men3_4 = getOptionsFormMaster(3, 4);
          vm.data_men3_5_1 = getOptionsFormMaster(3, 5, 1);
          vm.data_men3_5_2 = getOptionsFormMaster(3, 5, 2);
          vm.data_men3_5_3 = getOptionsFormMaster(3, 5, 3);
          vm.data_men3_7_2 = getOptionsFormMaster(3, 7, 2);
          var data_men3_8_tmp = getOptionsFormMaster(3, 8);
          vm.data_men3_8 = {
            c1: {
              class: _.clone(data_men3_8_tmp),
              division: []
            }
          };
          vm.selectParent3_8('c1');

          // men3_9
          vm.data_men3_9 = getOptionsFormMaster(3, 9);
          vm.data_men3_14 = getOptionsFormMaster(3, 14);
          // men4_2
          var data_men4_2_tmp = getOptionsFormMaster(4, 2);
          vm.data_men4_2 = {
            c1: {
              class: _.clone(data_men4_2_tmp),
              division: []
            },
            c2: {
              class: _.clone(data_men4_2_tmp),
              division: []
            },
            c3: {
              class: _.clone(data_men4_2_tmp),
              division: []
            }
          };
          // init for pulldown men4_2
          vm.selectParent4_2('c1');
          vm.selectParent4_2('c2');
          vm.selectParent4_2('c3');

          vm.data_men4_4 = getOptionsFormMaster(4, 4);
          vm.data_men4_5 = getOptionsFormMaster(4, 5);
          vm.data_men4_8 = getOptionsFormMaster(4, 8);
          vm.data_men4_10 = getOptionsFormMaster(4, 10, 5);
          vm.data_men4_15 = getOptionsFormMaster(4, 15);
        })
        .catch(function (res) {
          $scope.nofityError('マスターデータのロードが失敗しました。');
        });

      goukei3_7();
      goukei_4_10();
    }

    /**
     * get options by bukken, daikoumoku, kokoumoku
     * @param {*} _bukken
     * @param {*} _daikoumoku
     * @param {*} _kokoumoku
     */
    function getOptionsFormMaster(_bukken, _daikoumoku, _kokoumoku) {
      var condition = {
        bukken: _bukken,
        daikoumoku: _daikoumoku
      };
      if (_kokoumoku) {
        condition.kokoumoku = _kokoumoku;
      }
      // get first
      var filter = _.filter(vm.listMasterProperties, condition)[0];
      // exist
      if (filter) {
        try {
          // convert from string json to array
          var json = filter.json.replace(/'/g, '"');
          return JSON.parse(json);
        } catch (error) {
          // console.log(error, _bukken, _daikoumoku, _kokoumoku);
          $scope.nofityError('フォーマットjson' + error);
          return null;
        }
      }
      return null;
    }

    function selectParent3_8(select) {
      if (!vm.property.men3_8 || !vm.property.men3_8[select]) {
        return;
      }
      if (!vm.property.men3_8[select].class) {
        vm.property.men3_8[select].division = null;
        vm.data_men3_8[select].division = null;
        return;
      }
      var options = _.find(vm.data_men3_8[select].class, {
        name: vm.property.men3_8[select].class
      });
      vm.data_men3_8[select].division = options.child;
    }

    function selectParent4_2(select) {
      if (!vm.property.men4_2 || !vm.property.men4_2[select]) {
        return;
      }
      if (!vm.property.men4_2[select].class) {
        vm.property.men4_2[select].division = null;
        vm.data_men4_2[select].division = null;
        return;
      }
      var options = _.find(vm.data_men4_2[select].class, {
        name: vm.property.men4_2[select].class
      });
      vm.data_men4_2[select].division = options.child;
    }

    /**
     * save property (add new / edit)
     * @param {*} isValid valid
     */
    function save(isValid) {
      $scope.handleShowConfirm({
        message: '保存します。よろしいですか？'
      }, function () {
        if (!isValid) {
          vm.submitted = true;
          $scope.$broadcast('show-errors-check-validity', 'vm.form.propertyForm');
          return false;
        }
        // return null;
        vm.property.createOrUpdate()
          .then(function (res) {
            vm.busy = false;
            // $state.go('admin.properties.list');
            $scope.nofitySuccess('物件データの保存が完了しました。');
          })
          .catch(function (res) {
            vm.busy = false;
            $scope.nofityError('物件データの保存が失敗しました。' + res.data.message);
          });
      });
    }

    vm.changeSelect3_14 = function () {
      var str = vm.property.men3_14;
      if (str) {
        str += ',';
      } else {
        str = '';
      }
      str += vm.property.men3_14_1;
      vm.property.men3_14_1 = null;
      vm.property.men3_14 = str;
    };

    vm.changeSelect3_5 = function () {
      var str = vm.property.men3_5_3;
      if (str) {
        str += ',';
      } else {
        str = '';
      }
      str += vm.property.men3_5_31;
      vm.property.men3_5_31 = null;
      vm.property.men3_5_3 = str;
    };

    /* math logic */
    function goukei3_7() {
      var form = vm.property.men3_7_1;
      var c1 = getChild(form, 'c1');
      var c2 = getChild(form, 'c2');
      var c3 = getChild(form, 'c3');
      var c4 = getChild(form, 'c4');
      var c5 = getChild(form, 'c5');
      var c6 = getChild(form, 'c6');
      var c7 = getChild(form, 'c7');
      var c8 = getChild(form, 'c8');

      vm.property.men3_7_7 = {
        c1: c1 + c2 + c3 + c4,
        c2: c5 + c6 + c7 + c8
      };

      // 10.建築面積
      goukei3_10();
    }

    /**
     * form 3 10.建築面積
     */
    function goukei3_10() {
      // 10.建築面積
      // ｲ.建築面積
      var total_i = toFloat(vm.property.men3_10_1) + toFloat(vm.property.men3_10_3);
      vm.property.men3_10_4 = total_i;
      // // ﾛ.建蔽率
      vm.property.men3_10_2 = percentRoundLogic(total_i);
      // 11.延べ面積
      goukei3_11();
    }

    /**
     * 11.延べ面積
     */
    function goukei3_11() {
      // 11.延べ面積
      // ｲ.建築物全体
      vm.property.men3_11_5 = vm.property.men3_11_1 + vm.property.men3_11_4;

      var form = 'men3_11_';
      // men3_11_6 ~ men3_11_15 (ﾛ.~ﾙ.)
      for (var index = 6; index <= 15; index++) {
        var form_name = form + index;
        if (vm.property[form_name]) {
          var c1 = getChild(vm.property[form_name], 'c1');
          var c2 = getChild(vm.property[form_name], 'c2');
          var c3 = c1 + c2;
          vm.property[form_name].c3 = c3;
        }
      }
      // ﾜ.容積率
      vm.property.men3_11_3 = percentRoundLogic(vm.property.men3_11_2);
    }

    /**
     * percent & ROUNDUP
     * @param {*} number
     */
    function percent(number) {
      var factor = Math.pow(10, 2);
      number = Math.ceil(number * 100 * factor) / factor;
      return number;
    }

    function percentRoundLogic(input) {
      // =IF(AB271,ROUNDUP(BE280/AB271,4),IF(AB272,ROUNDUP(BE280/AB272,4),""))
      // men3_7_7 ﾎ.敷地面積の合計
      var c1 = vm.property.men3_7_7.c1;
      var c2 = vm.property.men3_7_7.c2;
      if (c1) {
        return percent(input / c1);
      } else if (vm.property.men3_7_5_2) {
        return percent(input / c2);
      }
      return 0;
    }

    function getChild(value, param) {
      if (!value || !value[param]) return 0;
      return parseFloat(value[param]);
    }

    function toFloat(value) {
      if (!value) {
        return 0;
      }
      return parseFloat(value);
    }

    vm.removeFloor = function (index) {
      $scope.handleShowConfirm({
        message: 'このデータを削除します。よろしいですか？'
      }, function () {
        vm.property.men4_10_5.splice(index, 1);
      });
    };

    vm.pushFloor = function () {
      if (!vm.property.men4_10_5) {
        vm.property.men4_10_5 = [];
      }
      vm.property.men4_10_5.push({
        c0: null,
        c1: null,
        c2: null,
        c3: null,
        c4: null
      });
    };

    /**
     * sum all of men4_10
     */
    function goukei_4_10() {
      var total_c1 = 0;
      var total_c2 = 0;
      var total_c3 = 0;
      var total_c4 = 0;
      if (vm.property.men4_10_5 && vm.property.men4_10_5.length > 0) {
        vm.property.men4_10_5.forEach(function (item) {
          total_c1 += item.c1;
          total_c2 += item.c2;
          total_c3 += item.c3;
          var c4 = item.c2 + item.c3;
          item.c4 = c4;
          total_c4 += c4;
        });
      }

      vm.property.men4_10_1 = total_c1;
      vm.property.men4_10_2 = total_c2;
      vm.property.men4_10_3 = total_c3;
      vm.property.men4_10_4 = total_c4;
    }

    /**
     * spec for master property (parent_flag = 1):
     * when click checked at checkbox child -> checkbox parent auto checked
     * @param {*} property_p parent
     * @param {*} property_c child
     * @param {*} checked status checked
     */
    vm.checkboxSelectChild = function (property_p, property_c, checked, propertyValue) {
      if (!propertyValue) {
        propertyValue = [];
      }

      var idx = propertyValue.indexOf(property_p.name);
      if (idx >= 0 && !checked && property_p.child) {
        var idc = propertyValue.indexOf(property_c.name);
        if (idc >= 0) {
          propertyValue.splice(idc, 1);
        }
        var hasChildCheck = false;
        property_p.child.forEach(function (c) {
          var idc = propertyValue.indexOf(c.name);
          if (idc >= 0) {
            hasChildCheck = true;
          }
        });
        if (!hasChildCheck) {
          propertyValue.splice(idx, 1);
        }
      }
    };

    /**
     * spec for master property (parent_flag = 1):
     * when click checked at checkbox parent (false)-> checkbox child auto unchecked
     * @param {*} property_p parent
     * @param {*} checked status checked
     */
    vm.checkboxSelectParent = function (property_p, checked, propertyValue) {
      var idx = propertyValue.indexOf(property_p.name);
      if (idx >= 0 && !checked) {

        if (property_p.child) {
          propertyValue.splice(idx, 1);
          property_p.child.forEach(function (c) {
            var idc = propertyValue.indexOf(c.name);
            if (idc >= 0) {
              propertyValue.splice(idc, 1);
            }
          });
        }
      }
    };

    vm.listMasterLawDetail = [];
    vm.listMasterLawTdfk = [];
    /**
     * automatic button
     * @param {*} propertyId
     */
    vm.autoChecked = function (propertyId) {
      $scope.handleShowConfirm({
        message: '自動チェックします。よろしいですか？'
      }, function () {
        vm.busyLoad = true;
        var property;
        var law;
        var listChecksheet = [];
        var listCheckSheetForm4 = [];
        var listCheckSheetForm7 = [];
        var listCheckSheetMention = [];
        LawsApi.listMasterLawDetail()
          .then(function (rs) {
            vm.listMasterLawDetail = rs.data;
            // get law by year
            return getFormProperty(propertyId);
          })
          .then(function (_property) {
            property = _property;
            var _year = new Date(property.men10).getFullYear();
            return LawsApi.listLawsByYear(_year);
          })
          .then(function (rs) {
            law = rs.data;
            return LawsApi.listMasterProperties();
          })
          .then(function (rs) {
            vm.listMasterProperties = rs.data;
            var _promises = [];
            // each law data
            law.law_details.law_details.forEach(function (lawData) {
              if (lawData.law_rules.length) {
                _promises.push(checkRules(property, lawData));
              }
            });
            return Promise.all(_promises);
          })
          .then(function (checkList) {
            // maping list master law with result check each law data
            listChecksheet = _.map(checkList, function (element) {
              var treasure = _.findWhere(vm.listMasterLawDetail, {
                _id: element.master_law
              });
              return _.extend(element, treasure);
            });
            return PropertyApi.listMasterCheckSheetForm4();
          })
          .then(function (rs) {
            listCheckSheetForm4 = rs.data;
            return PropertyApi.listMasterCheckSheetForm7();
          })
          .then(function (rs) {
            listCheckSheetForm7 = rs.data;
            if (property.men3_1_1) {
              return LawsApi.listMasterLawTdfk();
            }
            return null;
          })
          .then(function (rs) {
            vm.listMasterLawTdfk = rs ? rs.data : null;

            if (property.men3_1_1) {
              // men3_1_1 : "東京都"
              var _promises = [];
              law.todoufuken_regulations.todoufuken_regulations.forEach(function (tdfk) {
                if (property.men3_1_1 === tdfk.todoufuken) {
                  tdfk.law_regulations.forEach(function (lawData) {
                    if (lawData.law_rules.length) {
                      _promises.push(checkRules(property, lawData));
                    }
                  });
                }
              });
              return Promise.all(_promises);
            }
            return null;
          })
          .then(function (_checkListTdfk) {
            if (_checkListTdfk) {
              listCheckSheetMention = _.map(_checkListTdfk, function (element) {
                var treasure = _.findWhere(vm.listMasterLawTdfk, {
                  _id: element.master_law
                });
                return _.extend(element, treasure);
              });
              return listCheckSheetMention;
            }
            return null;
          })
          .then(function (_listCheckSheetMention) {
            listCheckSheetMention = _listCheckSheetMention;

            vm.property.doc.form1_ro = [];
            vm.property.doc.form1_ha = [];
            vm.property.doc.form4_ro = [];
            vm.property.doc.form4_ha1 = [];
            vm.property.doc.form7_ro1 = [];
            vm.property.doc.formMen_ro = [];
            vm.property.doc.formMen_ha = [];
            listChecksheet.forEach(function (item) {
              if (item.form1_ro && item.id) {
                vm.property.doc.form1_ro.push(item.id);
                // form ha
                vm.property.doc.form1_ha = $scope.checkSheetRoHa(item.id, true, vm.property.doc.form1_ha,
                  vm.property.doc.form1_ro, vm.listMasterLawDetail, 'form1');
                // form4
                var filterForm4 = _.filter(listCheckSheetForm4, {
                  form1: parseInt(item.id, 10)
                });
                filterForm4.forEach(function (form4) {
                  vm.property.doc.form4_ro.push(form4.id);
                  // form ha
                  vm.property.doc.form4_ha1 = $scope.checkSheetRoHa(form4.id, true, vm.property.doc.form4_ha1,
                    vm.property.doc.form4_ro, listCheckSheetForm4, 'form4');
                });
                // form7
                var filterForm7 = _.filter(listCheckSheetForm7, {
                  form1: parseInt(item.id, 10)
                });
                filterForm7.forEach(function (form7) {
                  vm.property.doc.form7_ro1.push(form7.id);
                });
              }
            });

            if (listCheckSheetMention) {
              listCheckSheetMention.forEach(function (item) {
                if (item.form1_ro && item.id) {
                  vm.property.doc.formMen_ro.push(item.id);
                  vm.property.doc.formMen_ha.push(item.id);
                }
              });
            }
            console.log(vm.property.doc);
            vm.property.createOrUpdate()
              .then(function (res) {
                vm.busyLoad = false;
                $scope.nofitySuccess('自動チェックが完了しました。');
              })
              .catch(function (res) {
                $scope.nofityError('自動チェックが失敗しました。' + res.data.message);
              });
          })
          .catch(function (err) {
            vm.busyLoad = false;
            console.log(err);
            $scope.nofityError('自動チェックが失敗しました。' + err);
          });
      });
    };

    /**
     * request api get property
     * @param {*} propertyId
     */
    function getFormProperty(propertyId) {
      return new Promise(function (resolve, reject) {
        var result = PropertiesService.get({
          propertyId: propertyId
        }).$promise;
        resolve(result);
      });
    }

    function checkRules(formProperty, lawData) {
      return new Promise(function (resolve, reject) {
        var FORM = 'men';
        var validateOrRules = [];
        var obj = [];
        // console.log('formProperty', formProperty);
        lawData.law_rules.forEach(function (rule) {
          // OR with rules
          var validateAndFields = [];
          var validateAndProperties = [];
          rule.fields.forEach(function (field) {
            // field.name = '3_6_1';
            var form_name = FORM + field.name;
            console.log('form_name', form_name);
            var resultCheckAnd = [];

            if (form_name === 'men4_10_5' || form_name === 'men4_10_6' || form_name === 'men4_10_7') {
              validateAndProperties = AutoCheckService.processFloor(field, formProperty, form_name);
              resultCheckAnd = AutoCheckService.checkedAND(validateAndProperties);
              validateAndFields.push(resultCheckAnd);
            } else {
              var valueInput = formProperty[form_name];
              // console.log('valueInput', valueInput);
              // check obj or number
              // obj: men3_7_1 {c1: 1, c2: 2, c3: 3, c4: 4, c5: 55}
              // number: men3_6_1 60
              if (!valueInput) {
                validateAndFields.push(false);
              } else {
                validateAndProperties = AutoCheckService.processProperties(field, valueInput, vm.listMasterProperties);
                resultCheckAnd = AutoCheckService.checkedAND(validateAndProperties);
                console.log('validateAndProperties', validateAndProperties, resultCheckAnd);
                validateAndFields.push(resultCheckAnd);
              }
            }
          });
          console.log('validateAndFields', validateAndFields);
          validateOrRules.push(AutoCheckService.checkedAND(validateAndFields));
        });
        // OR with rules
        console.log('validateOrRules', validateOrRules);
        var result = AutoCheckService.checkedOR(validateOrRules);
        console.log('checkedORvalidateOrRules', result);
        resolve({
          master_law: lawData.master_law,
          form1_ro: result
        });
      });
    }

    vm.setDecimal = function (form, decimal) {
      var value = 0;
      if (!vm.property[form]) {
        value = parseFloat(value).toFixed(decimal);
      } else {
        value = parseFloat(vm.property[form]).toFixed(decimal);
      }
      vm.property[form] = value;
    };

    // end controller
  }

  angular.module('properties.admin').filter('contains', function () {
    return function (array, needle) {
      if (!array) return 0;
      return array.indexOf(needle) >= 0;
    };
  });

  angular.module('properties.admin').directive('toDecimal', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function (value) {
          return '' + value;
        });
        ngModel.$formatters.push(function (value) {
          if (!value) {
            value = 0;
          }
          var text = parseFloat(value).toFixed(3);
          return text;
        });
      }
    };
  });

  angular.module('properties.admin').directive('firebaseDate', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        ngModel.$formatters.push(function (fromModel) {
          fromModel = new Date(fromModel);
          return fromModel;
        });
        ngModel.$parsers.push(function (fromField) {
          fromField = fromField.getTime();
          return fromField;
        });
      }
    };
  });
}());
