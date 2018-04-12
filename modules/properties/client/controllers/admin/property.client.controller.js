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
    vm.data_men3_3;
    vm.data_men3_4;
    vm.data_men3_7_2;
    vm.data_men3_8;
    vm.data_men3_9;
    vm.data_men3_14;
    vm.data_men3_13_5 = ['道路高さ制限不適用', '隣地高さ制限不適用', '北側高さ制限不適用'];
    vm.data_men4_2_1;
    vm.data_men4_2_2;
    vm.data_men4_2_3;
    vm.data_men4_3 = ['新築', '増築', '改築', '移転', '用途変更', '大規模の修繕', '大規模の模様替'];
    vm.data_men4_5;
    vm.data_men4_8;
    vm.data_men4_9_5 = ['建築基準法施行令第136条の2の11第1号イ', '建築基準法施行令第136条の2の11第1号ロ'];
    initData();

    function initData() {
      mathProperties();
      vm.property.men10 = new Date(vm.property.men10);

      LawsApi.listMasterProperties()
        .then((res) => {
          vm.listMasterProperties = res.data;
          vm.data_men3_3 = getOptionsFormMaster(3, 3);
          vm.data_men3_4 = getOptionsFormMaster(3, 4);
          vm.data_men3_7_2 = getOptionsFormMaster(3, 7, 2);
          vm.data_men3_8 = getOptionsFormMaster(3, 8);
          vm.data_men3_9 = getOptionsFormMaster(3, 9);
          vm.data_men3_14 = getOptionsFormMaster(3, 14);
          var dataSelectPropertyParent = getOptionsFormMaster(4, 2);
          if (vm.property.men3_8_1) {
            vm.selectPropertyParent(vm.property.men3_8_1, vm.data_men3_8);
          }

          vm.data_men4_2_1 = _.clone(dataSelectPropertyParent);
          if (vm.property.men4_2_1_1) {
            vm.selectPropertyParent4_2_1();
          }
          vm.data_men4_2_2 = _.clone(dataSelectPropertyParent);
          if (vm.property.men4_2_2_1) {
            vm.selectPropertyParent4_2_2();
          }
          vm.data_men4_2_3 = dataSelectPropertyParent;
          if (vm.property.men4_2_3_1) {
            vm.selectPropertyParent4_2_3();
          }
          vm.data_men4_5 = getOptionsFormMaster(4, 5);
          vm.data_men4_8 = getOptionsFormMaster(4, 8);
        })
        .catch((res) => {
          $scope.nofityError('マスターデータのロードが失敗しました。');
        });
    }

    function getOptionsFormMaster(_bukken, _daikoumoku, _kokoumoku) {
      var condition = { bukken: _bukken, daikoumoku: _daikoumoku };
      if (_kokoumoku) {
        condition.kokoumoku = _kokoumoku;
      }
      var filter = _.filter(vm.listMasterProperties, condition)[0];
      if (filter) {
        try {
          var json = filter.json.replace(/'/g, '"');
          return JSON.parse(json);
        } catch (error) {
          $scope.nofityError('Format json' + error);
          return null;
        }
      }
      return null;
    }

    function mathProperties() {
      vm.property.men3_7_5_1 = vm.property.men3_7_1_1 + vm.property.men3_7_1_2 + vm.property.men3_7_1_3 + vm.property.men3_7_1_4;
    }

    vm.selectPropertyParent = function (value, data) {
      //console.log(value, data);
      var options = _.find(data, {
        name: value
      });
      data.child_options = options.child;
    };

    vm.selectPropertyParent4_2_1 = function () {
      var options = _.find(vm.data_men4_2_1, {
        name: vm.property.men4_2_1_1
      });
      vm.data_men4_2_1.child_options = options.child;
    };
    vm.selectPropertyParent4_2_2 = function () {
      var options = _.find(vm.data_men4_2_2, {
        name: vm.property.men4_2_2_1
      });
      vm.data_men4_2_2.child_options = options.child;
    };
    vm.selectPropertyParent4_2_3 = function () {
      var options = _.find(vm.data_men4_2_3, {
        name: vm.property.men4_2_3_1
      });
      vm.data_men4_2_3.child_options = options.child;
    };

    // Save Property
    function save(isValid) {
      if (!isValid) {
        vm.submitted = true;
        $scope.$broadcast('show-errors-check-validity', 'vm.form.propertyForm');
        return false;
      }
     // return null;
      vm.property.createOrUpdate()
        .then((res) => {
          vm.busy = false;
          $state.go('admin.properties.list');
          $scope.nofitySuccess('物件データの保存が完了しました。');
        })
        .catch((res) => {
          vm.busy = false;
          $scope.nofityError('物件データの保存が失敗しました。' + res.data.message);
        });
    }

    // show class error or success in form
    vm.classError = (property) => {
      if (vm.submitted) {
        if (property) {
          return 'has-error';
        } else {
          return 'has-success';
        }
      }

      return '';
    };

    // show class error or success in form
    vm.classError = (property1, property2) => {
      if (vm.submitted) {
        if (property1 || property2) {
          return 'has-error';
        } else {
          return 'has-success';
        }
      }

      return '';
    };

    vm.changeSelect3_14 = () => {
      var str = vm.property.men3_14;
      if (str) {
        str += ',';
      }
      str += vm.property.men3_14_1;
      vm.property.men3_14_1 = null;
      vm.property.men3_14 = str;
    };

    /* math logic */
    vm.plusFor3_7_5 = () => {
      vm.property.men3_7_5_1 = vm.property.men3_7_1_1 + vm.property.men3_7_1_2 + vm.property.men3_7_1_3 + vm.property.men3_7_1_4;
      vm.property.men3_7_5_2 = vm.property.men3_7_1_5 + vm.property.men3_7_1_6 + vm.property.men3_7_1_7 + vm.property.men3_7_1_8;
      // 10.建築面積
      vm.goukei();
    };

    function roundUp(number, digits) {
      var factor = Math.pow(10, digits);
      return Math.ceil(number * factor) / factor;
    }

    function percent(number) {
      return roundUp(number * 100, 2);
    }

    function percentRoundLogic(input) {
      // =IF(AB271,ROUNDUP(BE280/AB271,4),IF(AB272,ROUNDUP(BE280/AB272,4),""))
      if (vm.property.men3_7_5_1) {
        return percent(input / vm.property.men3_7_5_1);
      } else if (vm.property.men3_7_5_2) {
        return percent(input / vm.property.men3_7_5_2);
      }
      return 0;
    }
    // form 3
    vm.goukei = () => {
      // 10.建築面積  ｲ.建築面積
      vm.property.men3_10_1_3 = vm.property.men3_10_1_1 + vm.property.men3_10_1_2;
      // ﾛ.建蔽率
      // men3_10_1_3 = BE280
      // men3_7_5_1 = AB271
      // men3_7_5_2 = AB272
      vm.property.men3_10_2 = percentRoundLogic(vm.property.men3_10_1_3);
      // 11.延べ面積 ｲ.建築物全体
      vm.property.men3_11_1_3 = vm.property.men3_11_1_1 + vm.property.men3_11_1_2;
      // ﾛ.地階の住宅又は老人ホーム、福祉ホームその他これらに類するものの部分
      vm.property.men3_11_2_3 = vm.property.men3_11_2_1 + vm.property.men3_11_2_2;
      // ﾊ.エレベーターの昇降路の部分
      vm.property.men3_11_3_3 = vm.property.men3_11_3_1 + vm.property.men3_11_3_2;
      // ﾆ.共同住宅の共用の廊下等の部分
      vm.property.men3_11_4_3 = vm.property.men3_11_4_1 + vm.property.men3_11_4_2;
      // ﾎ.自動車車庫等の部分
      vm.property.men3_11_5_3 = vm.property.men3_11_5_1 + vm.property.men3_11_5_2;
      // ﾍ.備蓄倉庫の部分
      vm.property.men3_11_6_3 = vm.property.men3_11_6_1 + vm.property.men3_11_6_2;
      // ﾄ.蓄電池の設置部分
      vm.property.men3_11_7_3 = vm.property.men3_11_7_1 + vm.property.men3_11_7_2;
      // ﾁ.自家発電設備の設置部分
      vm.property.men3_11_8_3 = vm.property.men3_11_8_1 + vm.property.men3_11_8_2;
      // ﾘ.貯水槽の設置部分
      vm.property.men3_11_9_3 = vm.property.men3_11_9_1 + vm.property.men3_11_9_2;
      // ﾇ.住宅の部分
      vm.property.men3_11_10_3 = vm.property.men3_11_10_1 + vm.property.men3_11_10_2;
      // ﾙ.老人ホーム、福祉ホームその他これらに類するものの部分
      vm.property.men3_11_11_3 = vm.property.men3_11_11_1 + vm.property.men3_11_11_2;
      // ｦ.延べ面積
      // ﾜ.容積率
      vm.property.men3_11_13 = percentRoundLogic(vm.property.men3_11_12);
    };

    function int(value) {
      if(!value) return 0;
      return parseInt(value, 10);
    }
    // form 4-10
    vm.goukei_4_10 = () => {
      vm.property.men4_10_1_4 = int(vm.property.men4_10_1_2) + int(vm.property.men4_10_1_3);
      vm.property.men4_10_2_4 = int(vm.property.men4_10_2_2) + int(vm.property.men4_10_2_3);
      vm.property.men4_10_3_4 = int(vm.property.men4_10_3_2) + int(vm.property.men4_10_3_3);
      vm.property.men4_10_4_4 = int(vm.property.men4_10_4_2) + int(vm.property.men4_10_4_3);
      vm.property.men4_10_5_4 = int(vm.property.men4_10_5_2) + int(vm.property.men4_10_5_3);
      vm.property.men4_10_6_4 = int(vm.property.men4_10_6_2) + int(vm.property.men4_10_6_3);
      vm.property.men4_10_7_4 = int(vm.property.men4_10_7_2) + int(vm.property.men4_10_7_3);
      vm.property.men4_10_8_4 = int(vm.property.men4_10_8_2) + int(vm.property.men4_10_8_3);
      vm.property.men4_10_9_4 = int(vm.property.men4_10_9_2) + int(vm.property.men4_10_9_3);

      vm.property.men4_10_10_2 = 
        int(vm.property.men4_10_1_2)
        + int(vm.property.men4_10_2_2)
        + int(vm.property.men4_10_3_2)
        + int(vm.property.men4_10_4_2)
        + int(vm.property.men4_10_5_2)
        + int(vm.property.men4_10_6_2)
        + int(vm.property.men4_10_7_2)
        + int(vm.property.men4_10_8_2)
        + int(vm.property.men4_10_9_2);

      vm.property.men4_10_10_3 = 
        int(vm.property.men4_10_1_3)
        + int(vm.property.men4_10_2_3)
        + int(vm.property.men4_10_3_3)
        + int(vm.property.men4_10_4_3)
        + int(vm.property.men4_10_5_3)
        + int(vm.property.men4_10_6_3)
        + int(vm.property.men4_10_7_3)
        + int(vm.property.men4_10_8_3)
        + int(vm.property.men4_10_9_3);

      vm.property.men4_10_10_4 = 
        int(vm.property.men4_10_1_4)
        + int(vm.property.men4_10_2_4)
        + int(vm.property.men4_10_3_4)
        + int(vm.property.men4_10_4_4)
        + int(vm.property.men4_10_5_4)
        + int(vm.property.men4_10_6_4)
        + int(vm.property.men4_10_7_4)
        + int(vm.property.men4_10_8_4)
        + int(vm.property.men4_10_9_4);
    }
  // end controller
  }
}());
