(function () {
  'use strict';

  angular
    .module('docs.admin')
    .controller('DocsAdminListController', DocsAdminListController);

  DocsAdminListController.$inject = ['PropertiesService', '$scope', '$state', '$window',
    'Authentication', 'Notification', 'LawsApi', 'PropertyApi', 'DocsService', 'DocsApi'];

  function DocsAdminListController(PropertiesService, $scope, $state, $window
    , Authentication, Notification, LawsApi, PropertyApi, DocsService, DocsApi) {
    var vm = this;

    vm.authentication = Authentication;
    vm.form = {};
    vm.currentPage = 1;
    vm.pageSize = 10;
    vm.listMasterLaw = [];
    getData();
    vm.pageChanged = function () {
      getData();
    };

    function getData() {
      var input = { page: vm.currentPage, limit: vm.pageSize };
      PropertiesService.get(input, function (output) {
        vm.properties = output.properties;
        vm.totalItems = output.total;
        vm.currentPage = output.current;
      });
    }

    /**
     * automatic button
     * @param {*} doc.docId
     */
    vm.autoChecked = function (doc) {
      console.log(doc);
      var property;
      var law;
      var listChecksheet = [];
      var listCheckSheetForm4 = [];
      getlistMasterLaw()
      .then(function (_listMasterLaw) {
        vm.listMasterLaw = _listMasterLaw;
        // get law by year
        return getFormProperty(doc.docId);
      })
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
          var treasure = _.findWhere(vm.listMasterLaw, { _id: element.master_law });
          return _.extend(element, treasure);
        });
        return getMasterCheckSheetForm4();
      })
      .then(function (_listCheckSheetForm4) {
        listCheckSheetForm4 = _listCheckSheetForm4;
        return DocsService.get({
          docId: doc.docId
        }).$promise;
      })
      .then(function (_doc) {
        _doc.form1_ro = [];
        _doc.form4_ha1 = [];
        listChecksheet.forEach(function (item) {
          if (item.form1_ro && item.id) {
            _doc.form1_ro.push(item.id);
            var filter = _.filter(listCheckSheetForm4, { form1: parseInt(item.id) });
            filter.forEach(function (form4) {
              _doc.form4_ha1.push(form4.id);
            });
          }
        });
        console.log(_doc);
        _doc.createOrUpdate()
        .then(function (res) {
          $scope.nofitySuccess('自動チェックが完了しました。');
        })
        .catch(function (res) {
          $scope.nofityError('自動チェックが失敗しました。' + res.data.message);
        });
      })
      .catch(function (err) {
        $scope.nofityError('自動チェックが失敗しました。' + err);
      });
    };


    function getlistMasterLaw() {
      return new Promise(function (resolve, reject) {
        // load list data masterlaw
        LawsApi.listMasterLaw()
          .then(function (res) {
            resolve(res.data);
          })
          .catch(function (res) {
            reject(res.data.message);
          });
      });
    }

    function getMasterCheckSheetForm4() {
      return new Promise(function (resolve, reject) {
        DocsApi.listMasterCheckSheetForm4()
        .then(function (res) {
          resolve(res.data);
        })
        .catch(function (res) {
          reject(res.data.message);
        });
      });
    }

    /**
     * request api get property by doc id
     * @param {*} doc doc id
     */
    function getFormProperty(doc) {
      return new Promise(function (resolve, reject) {
        PropertyApi.requestPropertyByDoc(doc)
        .then(function (res) {
          resolve(res.data);
        })
        .catch(function (res) {
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
        .then(function (res) {
          resolve(res.data);
        })
        .catch(function (res) {
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
        .then(function (res) {
          resolve(res.data);
        })
        .catch(function (res) {
          reject(res.data.message);
        });
      });
    }

    function checkRules(formProperty, lawData) {
      return new Promise(function (resolve, reject) {
        var FORM = 'men';
        var validateOrRules = [];
        var obj = [];

        lawData.law_rules.forEach(function (rule) {
          // OR with rules
          var validateAndFields = [];
          rule.fields.forEach(function (field) {
            // field.name = '3_6_1';
            var form_name = FORM + field.name;
            console.log(form_name);
            var valueInput = formProperty[form_name];
            // check obj or number
            // obj: men3_7_1 {c1: 1, c2: 2, c3: 3, c4: 4, c5: 55}
            // number: men3_6_1 60
            if (!valueInput) {
              validateAndFields.push(false);
            } else {
              // multi object
              var isMulti = checkMulti(valueInput);
                // AND with properties
              var validateAndProperties = [];
              field.properties.forEach(function (property) {
                var formMaster;
                switch (property.type) {
                  case 4:
                    validateAndProperties = processType4(isMulti, valueInput, property, validateAndProperties);
                    break;
                  case 3:
                    formMaster = getFormMaster(field.name);
                    validateAndProperties = processType3(isMulti, valueInput, property, validateAndProperties, formMaster);
                    break;
                  case 2:
                    formMaster = getFormMaster(field.name);
                    validateAndProperties = processType2(isMulti, valueInput, property, validateAndProperties, formMaster);
                    break;
                }
              });

              var resultCheckAnd = checkedAND(validateAndProperties);
              console.log(validateAndProperties, 'xxx', resultCheckAnd);
              validateAndFields.push(resultCheckAnd);
            }

          });
          console.log('validateAndFields', validateAndFields);
          validateOrRules.push(checkedAND(validateAndFields));
        });
        // OR with rules
        console.log('validateOrRules', validateOrRules);
        var result = checkedOR(validateOrRules);
        console.log('checkedOR', result);
        resolve({ master_law: lawData.master_law, form1_ro: result });
      });
    }

    function checkMulti(valueInput) {
      console.log('checkMulti', (valueInput.constructor));
      if (valueInput.constructor === Object) {
        return 1;
      }
      if (valueInput.constructor === Array) {
        return 2;
      }
      return 0;
    }

    function processType4(isMulti, valueInput, property, validateAndProperties) {
      if (isMulti === 0) {
        validateAndProperties.push(getConditonType4(valueInput, property));
      } else {
        var isEmpty = true;
        for (var i in valueInput) {
          if (valueInput[i]) {
            isEmpty = false;
            validateAndProperties.push(getConditonType4(valueInput[i], property));
          }
        }
        if (isEmpty) {
          validateAndProperties.push(false);
        }
      }
      return validateAndProperties;
    }

    function processType3(isMulti, valueInput, property, validateAndProperties, formMaster) {
      console.log('processType3', valueInput);
      if (formMaster.parent_flag === 0) {
        switch (isMulti) {
          case 0:
            validateAndProperties.push(checkPullDownAndCheckboxs(valueInput, property.value));
            break;
          case 1:
            // this case (law: listcheckbox, properties is multi and pulldown)
            // form4 - 4.構造
            for (var i in valueInput) {
              if (valueInput[i]) {
                validateAndProperties.push(checkCheckboxs([valueInput[i]], property.value));
              }
            }
            break;
          case 2:
            validateAndProperties.push(checkCheckboxs(valueInput, property.value));
            break;
        }
      } else if (formMaster.parent_flag === 1) {
        validateAndProperties.push(checkCheckboxsParent(valueInput, property.value, formMaster));
      }

      return validateAndProperties;
    }

    function processType2(isMulti, valueInput, property, validateAndProperties, formMaster) {
      var isCorrect = false;
      if (isMulti === 0) {
        if (formMaster.mapping === 1) {
          validateAndProperties.push(checkedEq(valueInput, property.value));
        }
        if (formMaster.mapping === 2) {
          var listLaws = valueInput.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
          console.log('processType2', property, listLaws);
          validateAndProperties.push(checkedContains(property.value, listLaws));
        }
      } else {
        // valueInput have mutil properties.
        console.log('valueInput', valueInput, isMulti);
        for (var i in valueInput) {
          if (formMaster.mapping === 1 && valueInput[i]) {
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

      return validateAndProperties;
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

    function checkPullDownAndCheckboxs(value, strLaws) {
      var listLaws = strLaws.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
      console.log('checkPullDownAndCheckboxs', value, listLaws);
      var isCorrect = false;
      listLaws.forEach(function (law) {
        if (!isCorrect) {
          console.log(law);
          if (value === law) {
            isCorrect = true;
          }
        }
      });
      return isCorrect;
    }

    function checkCheckboxs(listValue, strLaws) {
      var listLaws = strLaws.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
      console.log('checkCheckboxs', listValue, listLaws);
      var isCorrect = false;
      listLaws.forEach(function (law) {
        if (!isCorrect) {
          console.log(law);
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
      intersects.forEach(function (item) {
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
      options.forEach(function (option) {
        if (_.contains(listLaws, option.name)) {
          if (option.child) {
            var childs = [];
            option.child.forEach(function (child) {
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
      newjson.forEach(function (option) {
        if (_.contains(listValue, option.name)) {
          if (option.hasChild && option.child.length > 0) {
            var childs = [];
            option.child.forEach(function (child) {
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
      console.log('checkedEq', valueInput, valueProperty);
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
      conditions.forEach(function (condition) {
        if (eval(condition)) {
          isCorrect = true;
        }
      });
      return isCorrect;
    }

    /**
     * check AND in each array
     * [true, true, false] => false
     * [false, false, false] => false
     * [true, true, true] => true
     * @param {*} conditions array [true, true, false] => false
     */
    function checkedAND(conditions) {
      var isCorrect = false;
      if (conditions.length > 0) {
        isCorrect = true;
        conditions.forEach(function (condition) {
          if (!eval(condition)) {
            isCorrect = false;
          }
        });
      }

      return isCorrect;
    }
    // end controller
  }

}());
