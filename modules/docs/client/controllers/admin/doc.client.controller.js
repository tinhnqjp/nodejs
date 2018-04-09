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
    vm.form = {};
    initData();

    function initData() {

      LawsApi.listMasterLaw()
        .then((res) => {
          vm.listMasterLaw = res.data;
          // console.log(vm.listMasterLaw);
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

    vm.download = function (mendou) {
      $scope.exportExcel('#tableToExport', 'チェックシート', 'ダウンロード.xls');
    };

    vm.autoChecked = function (mendou) {
      var property;

      getFormProperty(vm.doc._id)
      .then(function (_property) {
        property = _property;
        var _year = new Date(property.men10).getFullYear();
        return getLawsByYear(_year);
      })
      .then(function (law) {
        var _promises = [];
        // console.log(law);
        law.law_details.law_details.forEach(lawData => {
          _promises.push(checkRules(property, lawData));
        });
        return Promise.all(_promises);
      })
      .then(function (checkList) {
        var result = _.map(checkList, function (element) {
          var treasure = _.findWhere(vm.listMasterLaw, { _id: element.master_law });
          return _.extend(element, treasure);
        });

        vm.doc.form1_ro = [];
        result.forEach( item => {
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

    function checkRules(formProperty, lawData) {
      return new Promise(function (resolve, reject) {
        var FORM = 'men';
        var validateOrRules = [];
        var obj = [];
        lawData.law_rules.forEach(rule => {
          // OR with rules
          rule.fields.forEach(field => {
            // field.name = '3_6_1';
            var form_name = FORM + field.name;
            var valueInput = formProperty[form_name];
            if (valueInput) {
              // AND with properties
              var validateAndProperties = [];
              field.properties.forEach(property => {
                if (property.type === 4) {
                  // output "value >= 15 AND value <= 35"
                  validateAndProperties.push(valueInput + ' ' + property.compare1 + property.value1 + ' && ' + valueInput + ' ' + property.compare2 + property.value2);
                }
              });
              if (!obj[form_name]) { obj[form_name] = [];}
              obj[form_name].push(checkedAND(validateAndProperties));
              validateOrRules.push(checkedAND(validateAndProperties));
            }
          });
        });
        // OR with rules
        var result = checkedOR(validateOrRules);
        resolve({ master_law: lawData.master_law, form1_ro: result });
      });
    }

    function checkedOR(conditions) {
      var isCorrect = false;
      conditions.forEach(condition => {
        if (eval(condition)) {
          isCorrect = true;
        }
      });
      return isCorrect;
    }

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
