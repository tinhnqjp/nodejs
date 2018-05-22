var module = angular.module('properties.services', []);
module.factory('AutoCheckService', function () {
  var MEN4_10_6 = 'men4_10_6';
  var MEN4_10_7 = 'men4_10_7';

  /**
   * process men4_10_5
   * type 2
   * 10.床 面 積 - 5	階種別
   */
  function processType2Each(valueInput, property, validateAndProperties) {
    var check = false;
    for (var i in valueInput) {
      if (checkedEq(valueInput[i].c0, property.value)) {
        check = true;
      }
    }
    validateAndProperties.push(check);
    return validateAndProperties;
  }

  /**
   * process men4_10_5
   * type 4
   * 10.床 面 積 - 6	階別 OR 7	合計
   */
  function processType4Each(valueInput, property, validateAndProperties, form_name) {
    var isEmpty = true;
    for (var i = 0; i < valueInput.length; i++) {
      var value_c;
      if (valueInput[i]) {
        if (form_name === MEN4_10_6) {
          value_c = valueInput[i].c1;
        } else if (form_name === MEN4_10_7) {
          value_c = valueInput[i].c4;
        }
        isEmpty = false;
        validateAndProperties.push(getConditonType4(value_c, property));
      }
    }
    if (isEmpty) {
      validateAndProperties.push(false);
    }
    return validateAndProperties;
  }

  function processType2(isMulti, valueInput, property, validateAndProperties, formMaster) {
    var isCorrect = false;
    if (isMulti === 0) {
      // string
      if (formMaster.mapping === 1) {
        validateAndProperties.push(checkedEq(valueInput, property.value));
      }
      if (formMaster.mapping === 2) {
        var listLaws = valueInput.replace(/^\s+|\s+$/g, '').split(/\s*,\s*/);
        console.log('processType2', property, listLaws);
        validateAndProperties.push(checkedContains(property.value, listLaws));
      }
    } else {
      // object
      // valueInput have mutil properties.
      console.log('valueInput', valueInput, isMulti);
      for (var i in valueInput) {
        if (formMaster.mapping === 1 && valueInput[i]) {
          validateAndProperties.push(checkedEq(valueInput[i], property.value));
        }
        // mapping chi gianh cho men4_2 or men3_8
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
              childs.push({
                name: child.name
              });
            }
          });
          newjson.push({
            name: option.name,
            child: childs,
            hasChild: true
          });
        } else {
          newjson.push({
            name: option.name,
            hasChild: false
          });
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
              childs.push({
                name: child.name
              });
            }
          });
          intersects.push({
            name: option.name,
            child: childs,
            hasChild: true
          });
        } else {
          intersects.push({
            name: option.name,
            hasChild: false
          });
        }
      }
    });
    return intersects;
  }

  function getFormMaster(_men, listMasterProperties) {
    var _dataField = _men.split('_');
    var condition = {
      bukken: parseInt(_dataField[0], 10),
      daikoumoku: parseInt(_dataField[1], 10)
    };
    if (_dataField[2]) {
      condition.kokoumoku = parseInt(_dataField[2], 10);
    }
    // get first
    var filter = _.filter(listMasterProperties, condition)[0];
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

  function exeEval(string) {
    return eval(string);
  }

  /**
   * get validateAndProperties
   * for 10.床 面 積
   */
  this.processProperties = function (field, valueInput, listMasterProperties) {
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
          formMaster = getFormMaster(field.name, listMasterProperties);
          validateAndProperties = processType3(isMulti, valueInput, property, validateAndProperties, formMaster);
          break;
        case 2:
          formMaster = getFormMaster(field.name, listMasterProperties);
          validateAndProperties = processType2(isMulti, valueInput, property, validateAndProperties, formMaster);
          break;
      }
    });
    return validateAndProperties;
  };

  /**
   * get validateAndProperties
   * for 10.床 面 積
   */
  this.processFloor = function (field, formProperty, form_name) {
    var valueInput = formProperty.men4_10_5;
    var validateAndProperties = [];
    field.properties.forEach(function (property) {
      var i;
      switch (property.type) {
        case 2:
          validateAndProperties = processType2Each(valueInput, property, validateAndProperties);
          break;
        case 4:
          validateAndProperties = processType4Each(valueInput, property, validateAndProperties, form_name);
          break;
      }
    });
    return validateAndProperties;
  };

  /**
   * check AND in each array
   * [true, true, false] => false
   * [false, false, false] => false
   * [true, true, true] => true
   * @param {*} conditions array [true, true, false] => false
   */
  this.checkedAND = function (conditions) {
    var isCorrect = false;
    if (conditions.length > 0) {
      isCorrect = true;
      conditions.forEach(function (condition) {
        if (!exeEval(condition)) {
          isCorrect = false;
        }
      });
    }
    return isCorrect;
  };

  /**
   check OR in each array
    * @param {*} conditions array [true, true, false] => false
    */
  this.checkedOR = function (conditions) {
    var isCorrect = false;
    conditions.forEach(function (condition) {
      if (exeEval(condition)) {
        isCorrect = true;
      }
    });
    return isCorrect;
  };
  // end service
  return this;
});
