/**
 * 说明:社区顾问-出售房源提交
 * 作者:lihao
 * 时间:2015-7-23
 */
var app = angular.module('app', ['mdGlobal', 'mdServer', 'w5c.validator']);
//注册控制器,依赖$scope
app.controller("ctrl", ["$rootScope", "$scope", "$filter", "serverSvc", "weixinSvc", function($rootScope, $scope, $filter, serverSvc, weixinSvc) {

  $scope.entity = {};
  $scope.chooseImgList = [];

  /**
   * 地址选定后的回调
   */
  $scope.addrSelected = function(item) {
    $scope.entity.Address = $filter("getAddr")(item);
  }

  /**
   * 上传图片
   */
  $scope.uploadImg = function() {
    //图片选择
    weixinSvc.chooseImage(function(imgList) {
      $scope.$apply(function() {
        $scope.chooseImgList = $scope.chooseImgList.concat(imgList);
        //图片上传
        weixinSvc.uploadImageList($scope.chooseImgList, function(serverImages) {
          $scope.entity.ImageUrl = serverImages;
        });
      });
    });
  }

  /**
   * 删除照片
   */
  $scope.removeImg = function(imgIndex) {
    //删除本地图片
    $scope.chooseImgList.splice(imgIndex, 1);
    //删除后台图片(需要提交的图片)
    $scope.entity.ImageUrl.splice(imgIndex, 1);
  }

  $scope.back = function() {
    $rootScope.goto(1);
  };

  var vm = $scope.vm = {
    htmlSource: ""
  };

  vm.saveEntityPage1 = function(form) {
    //do somethings for bz
    $rootScope.goto(2);
  };

  vm.saveEntityPage2 = function(form) {
    $scope.isLoading = true;
    //do somethings for bz
    serverSvc.BaseInfoAdd(angular.extend({}, $scope.entity, {
      UserID: $rootScope.userInfo.ID,
      PropertyID: 1,
      RoomType: $scope.room
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
    address: {
      required: "小区地址不能为空",
      pattern: "小区地址限制在30字以内"
    },
    username: {
      required: "输入的房东姓名不能为空",
      pattern: "房东姓名不能超过4个汉字",
    },
    tel: {
      required: "手机号不能为空",
      pattern: "您输入的不是正确的手机号",
      w5cuniquecheck: "输入手机号已经存在，请重新输入"
    },
    area: {
      required: "输入面积不能为空",
      pattern: "面积必须是0-999的整数"
    },
    price: {
      required: "期望售价不能为空",
      pattern: "期望售价必须是0-9999的整数"
    },
    buildingNo: {
      required: "楼栋号不能为空",
      pattern: "楼栋号必须为0-999的整数"
    },
    unit: {
      required: "单元号不能为空",
      pattern: "单元号必须为0-99的整数"
    },
    roomNo: {
      required: "房号不能为空",
      pattern: "房号必须为6位以内的数字或字母"
    }
    /*,
        password: {
          required: "密码不能为空",
        },
        repeatPassword: {
          required: "重复密码不能为空",
          repeat: "两次密码输入不一致"
        },
        email: {
          required: "输入的邮箱地址不能为空",
          email: "输入邮箱地址格式不正确"
        },
        password: {
          required: "密码不能为空",
          minlength: "密码长度不能小于{minlength}",
          maxlength: "密码长度不能大于{maxlength}"
        },
        repeatPassword: {
          required: "重复密码不能为空",
          repeat: "两次密码输入不一致"
        },
        number: {
          required: "数字不能为空"
        }*/
  });

}]);