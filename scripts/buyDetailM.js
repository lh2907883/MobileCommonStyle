/**
 * 说明:客户经理-购房详情页
 * 作者:lihao
 * 时间:2015-7-23
 */
var app = angular.module('app', ['mdGlobal', 'mdServer', 'w5c.validator']);
//注册控制器,依赖$scope和time模块
app.controller("ctrl", ["$rootScope", "$scope", "serverSvc", "queryStringSvc", "weixinSvc", "config", function($rootScope, $scope, serverSvc, queryStringSvc, weixinSvc, config) {
  /**
   * 获取详情
   */
  var GetBaseExtendInfoByID = function() {
    $scope.isLoading = true;
    var ids = queryStringSvc.get();
    serverSvc.GetBaseExtendInfoByID({
      BaseID: ids.BaseID,
      UserID: $rootScope.userInfo.ID
    }, function(res) {
      $scope.isLoading = false;
      $scope.entity = res.result.Info;
    });
  }

  //如果收到userInfo代表已经加载完毕
  if($rootScope.userInfo){
    GetBaseExtendInfoByID();
  }
  else{
    $scope.isLoading = true;
    $scope.$on("globalInited", function(event){
      GetBaseExtendInfoByID();
    });
  }

  $scope.entity = {};

  $scope.back = function() {
    // $rootScope.goto(1);
    window.location.href = "workshop.html";
  };
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
   * 编辑(会复制entity)
   */
  $scope.edit = function(form) {
    $scope.copyEntity = angular.extend({}, $scope.entity, {
      PropertyID: 3,
      UserID: $rootScope.userInfo.ID
    });
    $scope.regionChanged();
    $rootScope.goto(2);
  };

  /**
   * 区域改变时的回调
   */
  $scope.regionChanged = function() {
    if ($scope.copyEntity) {
      $scope.copyEntity.RegionName = config.Regions[$scope.copyEntity.RegionID];
      if ($scope.copyEntity.RegionID) {
        serverSvc.GetRegion($scope.copyEntity.RegionID, function(res) {
          $scope.District = res.result.Info;
          $scope.districtChanged();
        }, true);
      } else {
        $scope.District = [];
        $scope.districtChanged();
      }
    }
  }
    /**
     * 根据街道ID获取名字
     */
  $scope.districtChanged = function() {
    for (var i in $scope.District) {
      if ($scope.District[i].ID == $scope.copyEntity.District) {
        $scope.copyEntity.DistrictName = $scope.District[i].Name;
        return;
      }
    }
    $scope.copyEntity.District = "";
    $scope.copyEntity.DistrictName = "";
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
    username: {
      required: "输入的客户姓名不能为空",
      pattern: "客户姓名不能超过4个汉字",
    },
    tel: {
      required: "手机号不能为空",
      pattern: "您输入的不是正确的手机号",
      w5cuniquecheck: "输入手机号已经存在，请重新输入"
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
    demand: {
      pattern: "其他需求限制在30字以内"
    },
    region: {
      required: "期望区域不能为空"
    },
    district: {
      required: "期望街道不能为空"
    },
    area: {
      required: "输入面积不能为空"
    },
    price: {
      required: "期望售价不能为空"
    }
  });
}]);