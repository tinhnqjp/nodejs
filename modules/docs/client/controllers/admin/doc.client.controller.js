(function () {
  'use strict';

  angular
    .module('docs.admin')
    .controller('DocsAdminController', DocsAdminController);

  DocsAdminController.$inject = ['$scope', '$state', '$window', 'docResolve',
    'Authentication', 'Notification', 'Excel', '$timeout', 'DocsApi', 'LawsApi', 'PropertyApi'
  ];

  function DocsAdminController($scope, $state, $window, doc, Authentication,
    Notification, Excel, $timeout, DocsApi, LawsApi, PropertyApi) {
    var vm = this;

    vm.doc = doc;
    vm.authentication = Authentication;
    vm.listMasterLaw = [];
    vm.listMasterProperties = [];
    vm.form = {};
    initData();

    /**
     * init method
     */
    function initData() {
      // load list data masterlaw
      LawsApi.listMasterLaw()
        .then((res) => {
          vm.listMasterLaw = res.data;
        })
        .catch((res) => {
          $scope.nofityError('マスターデータのロードが失敗しました。');
        });
    }

    /**
     * save to database rules
     * @param {*} isValid check validation
     */
    vm.save = function (isValid) {
      $scope.handleShowConfirm({
        message: '保存します。よろしいですか？'
      }, () => {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'vm.form.lawRulesForm');
          return false;
        }
        vm.doc.createOrUpdate()
          .then((res) => {
            $scope.nofitySuccess('第一号様式データの保存が完了しました。');
          })
          .catch((res) => {
            $scope.nofityError('第一号様式データの保存が失敗しました。' + res.data.message);
          });
      });
    };

    /**
     * down file excel checksheet
     * @param {*} mendou form1, form4, form7
     */
    vm.download = function (mendou) {
      $scope.exportExcel('#tableToExport', 'チェックシート', 'ダウンロード.xls');
    };

    /**
     * automatic button
     * @param {*} mendou form1, form4, form7
     */
    vm.autoChecked = function (mendou) {
      var property;
      var law;
      // get law by year
      getFormProperty(vm.doc._id)
      .then(function (_property) {
        property = _property;
        var _year = new Date(property.men10).getFullYear();
        return getLawsByYear(_year);
      })
      .then(function (_law) {
        law = _law;
        return getMasterProperties();
      })
      .then(function (_listMaster) {
        vm.listMasterProperties = _listMaster;
        var _promises = [];
        // each law data
        law.law_details.law_details.forEach(lawData => {
          if (lawData.law_rules.length) {
            _promises.push(checkRules(property, lawData));
          }
        });
        return Promise.all(_promises);
      })
      .then(function (checkList) {
        // maping list master law with result check each law data
        var result = _.map(checkList, function (element) {
          var treasure = _.findWhere(vm.listMasterLaw, { _id: element.master_law });
          return _.extend(element, treasure);
        });
        // update value
        vm.doc.form1_ro = [];
        result.forEach(item => {
          if (item.form1_ro) {
            vm.doc.form1_ro.push(item.id);
          }
        });
        if (!$scope.$$phase) $scope.$digest();
      })
      .catch(function (err) {
        console.log('error', err);
      });
    };

    /**
     * request api get property by doc id
     * @param {*} doc doc id
     */
    function getFormProperty(doc) {
      return new Promise(function (resolve, reject) {
        PropertyApi.requestPropertyByDoc(doc)
        .then((res) => {
          resolve(res.data);
        })
        .catch((res) => {
          reject(res.data.message);
        });
      });
    }

    /**
     * request api get law by year
     * @param {*} year 2018, 2019...
     */
    function getLawsByYear(year) {
      return new Promise(function (resolve, reject) {
        LawsApi.requestLawsByYear(year)
        .then((res) => {
          resolve(res.data);
        })
        .catch((res) => {
          reject(res.data.message);
        });
      });
    }

    /**
     * request api get master properties
     */
    function getMasterProperties() {
      return new Promise(function (resolve, reject) {
        LawsApi.listMasterProperties()
        .then((res) => {
          resolve(res.data);
        })
        .catch((res) => {
          reject(res.data.message);
        });
      });
    }

    function checkRules(formProperty, lawData) {
      return new Promise(function (resolve, reject) {
        var FORM = 'men';
        var validateOrRules = [];
        var obj = [];

        lawData.law_rules.forEach(rule => {
          // OR with rules
          var validateAndFields = [];
          rule.fields.forEach(field => {
            // field.name = '3_6_1';
            var form_name = FORM + field.name;
            var valueInput = formProperty[form_name];
            var i;
            // check obj or number
            // obj: men3_7_1 {c1: 1, c2: 2, c3: 3, c4: 4, c5: 55}
            // number: men3_6_1 60
            if (valueInput) {
              var isObject = _.isObject(valueInput);
                // AND with properties
              var validateAndProperties = [];
              field.properties.forEach(property => {
                // type 4
                if (property.type === 4) {
                  // output "value >= 15 AND value <= 35"
                  if (!isObject) {
                    validateAndProperties.push(getConditonType4(valueInput, property));
                  } else {
                    for (i in valueInput) {
                      if (valueInput[i]) {
                        validateAndProperties.push(getConditonType4(valueInput[i], property));
                      } else {
                        validateAndProperties.push(false);
                      }
                    }
                  }
                } else {
                  var formMaster = getFormMaster(field.name);
                  if (property.type === 3 && formMaster.parent_flag === 0) {

                    if (!isObject) {
                      validateAndProperties.push(checkCheckboxs(valueInput, property.value));
                    } else {
                      // this case (law: listcheckbox, properties is multi and pulldown)
                      // form4 - 4.構造
                      for (i in valueInput) {
                        if (valueInput[i]) {
                          validateAndProperties.push(checkCheckboxs([valueInput[i]], property.value));
                        } else {
                          validateAndProperties.push(false);
                        }
                      }
                    }
                  }
                  if (property.type === 3 && formMaster.parent_flag === 1) {
                    validateAndProperties.push(checkCheckboxsParent(valueInput, property.value, formMaster));
                  }

                  // type 2 pulldown
                  if (property.type === 2) {
                    var isCorrect = false;
                    if (!isObject) {
                      if (formMaster.mapping === 1) {
                        validateAndProperties.push(checkedEq(valueInput, property.value));
                      }
                      if (formMaster.mapping === 2) {
                        var listLaws = valueInput.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
                        validateAndProperties.push(checkedContains(property, listLaws));
                      }
                    } else {
                      // valueInput have mutil properties
                      for (i in valueInput) {
                        if (formMaster.mapping === 1) {
                          validateAndProperties.push(checkedEq(valueInput[i], property.value));
                        }
                        if (formMaster.mapping === 3 && property.value) {
                          var check = false;
                          if (checkedEq(valueInput[i].class, property.value)) {
                            check = true;
                          } else if (checkedEq(valueInput[i].division, property.value)) {
                            check = true;
                          }
                          validateAndProperties.push(check);
                        }
                      }
                    }
                  }
                }
              });
              console.log(validateAndProperties);
              validateAndFields.push(checkedAND(validateAndProperties));
            } else {
              validateAndFields.push(false);
            }

          });

          validateOrRules.push(checkedAND(validateAndFields));
        });
        // OR with rules
        var result = checkedOR(validateOrRules);

        resolve({ master_law: lawData.master_law, form1_ro: result });
      });
    }

    function getConditonType4(valueInput, property) {
      var strCondition = '';
      if (property.compare1 && property.value1) {
        strCondition += valueInput + ' ' + property.compare1 + ' ' + property.value1;
      }
      if (strCondition && property.compare2 && property.value2) {
        strCondition += ' && ';
      }
      if (property.compare2 && property.value2) {
        strCondition += valueInput + ' ' + property.compare2 + ' ' + property.value2;
      }
      return strCondition;
    }

    function checkCheckboxs(listValue, strLaws) {
      var listLaws = strLaws.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
      var isCorrect = false;
      listLaws.forEach(law => {
        if (!isCorrect) {
          if (_.contains(listValue, law)) {
            isCorrect = true;
          }
        }
      });
      return isCorrect;
    }

    function checkCheckboxsParent(listValue, strLaws, formMaster) {
      var json = formMaster.json.replace(/'/g, '"');
      var options = JSON.parse(json);
      var listLaws = strLaws.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
      var intersects = checkParentChild(options, listLaws, listValue);
      var isCorrect = false;
      intersects.forEach(item => {
        if (!isCorrect) {
          if (!item.hasChild || (item.hasChild && item.child.length > 0)) {
            isCorrect = true;
          }
        }
      });
      return isCorrect;
    }

    function checkParentChild(options, listLaws, listValue) {
      // json of master properties
      // and list value of law
      // -> intersect list
      var newjson = [];
      options.forEach(option => {
        if (_.contains(listLaws, option.name)) {
          if (option.child) {
            var childs = [];
            option.child.forEach(child => {
              if (_.contains(listLaws, child.name)) {
                childs.push({ name: child.name });
              }
            });
            newjson.push({ name: option.name, child: childs, hasChild: true });
          } else {
            newjson.push({ name: option.name, hasChild: false });
          }
        }
      });

      var intersects = [];
      // intersect list (master properties + value of law)
      // and list value of form
      // -> intersect list
      newjson.forEach(option => {
        if (_.contains(listValue, option.name)) {
          if (option.hasChild && option.child.length > 0) {
            var childs = [];
            option.child.forEach(child => {
              if (_.contains(listValue, child.name)) {
                childs.push({ name: child.name });
              }
            });
            intersects.push({ name: option.name, child: childs, hasChild: true });
          } else {
            intersects.push({ name: option.name, hasChild: false });
          }
        }
      });
      return intersects;
    }

    function getFormMaster(_men) {
      var _dataField = _men.split('_');
      var condition = { bukken: parseInt(_dataField[0], 10), daikoumoku: parseInt(_dataField[1], 10) };
      if (_dataField[2]) {
        condition.kokoumoku = parseInt(_dataField[2], 10);
      }
      // get first
      var filter = _.filter(vm.listMasterProperties, condition)[0];
      // exist
      if (filter) {
        return filter;
      }
      return null;
    }

    function checkedEq(valueInput, valueProperty) {
      var isCorrect = false;
      if (valueInput === valueProperty) {
        isCorrect = true;
      }
      return isCorrect;
    }

    function checkedContains(valueInput, listChecked) {
      var isCorrect = false;
      if (_.contains(listChecked, valueInput)) {
        isCorrect = true;
      }
      return isCorrect;
    }
    /**
     check OR in each array
     * @param {*} conditions array [true, true, false] => false
     */
    function checkedOR(conditions) {
      var isCorrect = false;
      conditions.forEach(condition => {
        if (eval(condition)) {
          isCorrect = true;
        }
      });
      return isCorrect;
    }

    /**
     * check AND in each array
     * @param {*} conditions array [true, true, false] => false
     */
    function checkedAND(conditions) {
      var isCorrect = true;
      conditions.forEach(condition => {
        if (!eval(condition)) {
          isCorrect = false;
        }
      });
      return isCorrect;
    }
    // End controller
  }

  angular.module('docs.admin').filter('contains', function () {
    return function (array, needle) {
      return array.indexOf(needle) >= 0;
    };
  });


}());
