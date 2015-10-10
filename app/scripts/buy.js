/**
 * 说明:社区顾问-购房提交
 * 作者:lihao
 * 时间:2015-7-23
 */
var app = angular.module('app', ['mdGlobal', 'mdServer', 'w5c.validator']);
//注册控制器,依赖$scope和time模块
app.controller("ctrl", ["$rootScope", "$scope", "serverSvc", "weixinSvc", function($rootScope, $scope, serverSvc, weixinSvc) {
  $scope.a_area = '1';
  $scope.RegionId = '1';
  $scope.entity = {};
  $scope.district = {};

  $scope.back = function() {
    $rootScope.goto(1);
  };

  var vm = $scope.vm = {
    htmlSource: ""
  };

  vm.getDistrict = function(regionId) {
    $scope.a_area = regionId;
    $scope.district = undefined;
    serverSvc.GetRegion(regionId, function(res) {
      $scope.District = res.result.Info;
    }, true);
  }
  vm.getDistrict(1);

  vm.saveEntityPage1 = function(form) {
    //do somethings for bz
    $rootScope.goto(2);
  };

  vm.saveEntityPage2 = function(form) {
    $scope.isLoading = true;
    //do somethings for bz
    serverSvc.BaseInfoAdd(angular.extend({}, $scope.entity, {
      UserID: $rootScope.userInfo.ID,
      PropertyID: 3,
      RegionID: $scope.a_area,
      RoomType: $scope.room,
      District: $scope.district.ID,
      Address: $scope.district.Name
    }), function(res) {
      $scope.isLoading = false;
      var BaseId = res.result.BaseID;
      window.location.href = "subSuccess.html?BaseID=" + BaseId;
    });
  };
}]);

app.config(["w5cValidatorProvider", function(w5cValidatorProvider) {

  // 全局配置
  w5cValidatorProvider.config({
    blurTrig: false,
    showError: false,
    removeError: false
  });

  w5cValidatorProvider.setRules({
    username: {
      required: "输入的客户姓名不能为空",
      pattern: "客户姓名不能超过4个汉字"
    },
    tel: {
      required: "手机号不能为空",
      pattern: "您输入的不是正确的手机号",
      w5cuniquecheck: "输入手机号已经存在，请重新输入"
    },
    area: {
      required: "输入面积不能为空"
    },
    price: {
      required: "购房预算不能为空"
    },
    demand: {
      pattern: "购房需求限制在30字以内"
    }
  });
}]);