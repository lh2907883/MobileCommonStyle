/**
 * 说明:客户经理-出售房源详情页
 * 作者:lihao
 * 时间:2015-7-23
 */
var app = angular.module('app', ['mdGlobal', 'mdServer', 'w5c.validator']);
//注册控制器,依赖$scope和time模块
app.controller("ctrl", ["$rootScope", "$scope", "$filter", "serverSvc", "queryStringSvc", "weixinSvc", function($rootScope, $scope, $filter, serverSvc, queryStringSvc, weixinSvc) {
  var GetBaseExtendInfoByID = function() {
    $scope.isLoading = true;
    var ids = queryStringSvc.get();
    serverSvc.GetBaseExtendInfoByID({
      BaseID: ids.BaseID,
      UserID: $rootScope.userInfo.ID
    }, function(res) {
      $scope.isLoading = false;
      $scope.entity = res.result.Info;
      $scope.imglist = res.result.ImageList;
    });
  };

  //如果收到userInfo代表已经加载完毕
  if ($rootScope.userInfo) {
    GetBaseExtendInfoByID();
  } else {
    $scope.isLoading = true;
    $scope.$on("globalInited", function(event) {
      GetBaseExtendInfoByID();
    });
  }

  $scope.entity = {};
  /**
   * 地址选定后的回调
   */
  $scope.addrSelected = function(item) {
    $scope.copyEntity.Address = $filter("getAddr")(item);
  }
  /**
   * 后退
   * @return {[type]} [description]
   */
  $scope.back = function(){
    window.location.href="workshop.html";
  }
  $scope.pre = function() {
    $rootScope.goto(1);
  };
  /**
   * 改变状态
   * @param  {[int]} toStatusID [改编后的状态ID]
   */
  $scope.updateStatus = function(toStatusID){
    $scope.isLoading = true;
    serverSvc.UpdateBaseStatus({
      BaseID: $scope.entity.BaseID,
      StatusID: toStatusID
    }, function(res) {
      $scope.isLoading = false;
      if(res.status){
        $scope.back();
      }
    });
  };
  /**
   * 编辑
   */
  $scope.edit = function() {
    $scope.copyEntity = angular.extend({}, $scope.entity, {
      PropertyID: 1,
      UserID : $rootScope.userInfo.ID
    });
    $scope.chooseImgList = angular.copy($scope.imglist);
    $rootScope.goto(2);
  };

  /**
   * 上传图片
   */
  $scope.uploadImg = function(){
    //图片选择
    weixinSvc.chooseImage(function(imgList){
      $scope.$apply(function(){
        $scope.chooseImgList = $scope.chooseImgList.concat(imgList);
        //图片上传
        weixinSvc.uploadImageList($scope.chooseImgList, function(serverImages){
          $scope.entity.ImageUrl = serverImages;
        });
      });
    });
  }

  /**
   * 删除照片
   */
  $scope.removeImg = function(imgIndex){
    //删除本地图片
    $scope.chooseImgList.splice(imgIndex, 1);
    //删除后台图片(需要提交的图片)
    $scope.entity.ImageUrl.splice(imgIndex, 1);
  }

  /**
   * 完善提交
   */
  $scope.sub = function() {
    $scope.isLoading = true;
    serverSvc.UpdateBaseExtendInfo($scope.copyEntity, function(res) {
      $scope.isLoading = false;
      if(res.status){
        $scope.back();
      }
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
      required: "房源地址不能为空",
      pattern: "房源地址限制在30汉字以内"
    },
    username: {
      required: "输入的业主姓名不能为空",
      pattern: "业主姓名不能超过4个汉字",
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
    },
    floor: {
      required: "户型的总楼层必须为0-9的数字",
      pattern: "总楼层必须为0-999的整数"
    },
    rooms: {
      required: "户型的房间数不能为空",
      pattern: "户型的房间数为0-9的数字"
    },
    parlor: {
      pattern: "户型的厅数为0-9的数字"
    },
    bashroom: {
      pattern: "户型的卫数为0-9的数字"
    },
    year: {
      pattern: "年份需为大于1900，小于2100的整数"
    },
    month: {
      pattern: "月份只能是1~12的整数"
    }
  });
}]);