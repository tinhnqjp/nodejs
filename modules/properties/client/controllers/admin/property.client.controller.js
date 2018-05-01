(function () {
  'use strict';

  angular
    .module('properties.admin')
    .controller('PropertiesAdminController', PropertiesAdminController);

  PropertiesAdminController.$inject = ['$scope', '$state', '$window', 'propertyResolve', 'Authentication', 'Notification', 'PropertiesService', 'LawsApi'];

  function PropertiesAdminController($scope, $state, $window, property, Authentication, Notification, PropertiesService, LawsApi) {
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
    initData();

    /**
     * init
     */
    function initData() {
      // convert to date
      vm.property.men10 = new Date(vm.property.men10);
      // sum men3_7_5
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
            c1: { class: _.clone(data_men3_8_tmp), division: [] }
          };
          vm.selectParent3_8('c1');

          // men3_9
          vm.data_men3_9 = getOptionsFormMaster(3, 9);
          vm.data_men3_14 = getOptionsFormMaster(3, 14);
          // men4_2
          var data_men4_2_tmp = getOptionsFormMaster(4, 2);
          vm.data_men4_2 = {
            c1: { class: _.clone(data_men4_2_tmp), division: [] },
            c2: { class: _.clone(data_men4_2_tmp), division: [] },
            c3: { class: _.clone(data_men4_2_tmp), division: [] }
          };
          // init for pulldown men4_2
          vm.selectParent4_2('c1');
          vm.selectParent4_2('c2');
          vm.selectParent4_2('c3');

          vm.data_men4_4 = getOptionsFormMaster(4, 4);
          vm.data_men4_5 = getOptionsFormMaster(4, 5);
          vm.data_men4_8 = getOptionsFormMaster(4, 8);
          vm.data_men4_10 = getOptionsFormMaster(4, 10, 14);
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
      var condition = { bukken: _bukken, daikoumoku: _daikoumoku };
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
          $scope.nofityError('Format json' + error);
          return null;
        }
      }
      return null;
    }

    function selectParent3_8(select) {
      if (!vm.property.men3_8 || !vm.property.men3_8[select].class) {
        return;
      }
      var options = _.find(vm.data_men3_8[select].class, {
        name: vm.property.men3_8[select].class
      });
      vm.data_men3_8[select].division = options.child;
    }

    function selectParent4_2(select) {
      if (!vm.property.men4_2 || !vm.property.men4_2[select].class) {
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
      if (!value) { return 0; }
      return parseFloat(value);
    }

    /**
     * sum all of men4_10
     */
    function goukei_4_10() {
      // 階別合計 men4_10_5 ~ men4_10_13
      var form = 'men4_10_';
      var total_c1 = 0;
      var total_c2 = 0;
      var total_c3 = 0;
      var total_c4 = 0;
      for (var index = 5; index <= 13; index++) {
        var form_name = form + index;
        if (vm.property[form_name]) {

          var c1 = getChild(vm.property[form_name], 'c1');
          var c2 = getChild(vm.property[form_name], 'c2');
          var c3 = getChild(vm.property[form_name], 'c3');
          var c4 = c2 + c3;
          vm.property[form_name].c4 = c4;
          total_c4 += c4;
          total_c1 += c1;
          total_c2 += c2;
          total_c3 += c3;
        }
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
  // end controller
  }

  angular.module('properties.admin').filter('contains', function () {
    return function (array, needle) {
      if (!array) return 0;
      return array.indexOf(needle) >= 0;
    };
  });
}());
