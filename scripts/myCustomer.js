/**
 * 说明:社区顾问-客户列表
 * 作者:lihao
 * 时间:2015-7-23
 */
var app = angular.module('app', ['mdGlobal', 'mdServer', 'mdLozyload']);
//注册控制器,依赖$scope
app.controller("ctrl", ["$rootScope", "$scope", "serverSvc", "lazyloadSvc", "config", function($rootScope, $scope, serverSvc, lazyloadSvc, config) {
  //页码(从0开始),页大小
  var pIndex, pSize;
  var lazyload = lazyloadSvc.init(angular.element(document.getElementById("listBody")), {
    onLazyload: function(callback){
      GetBaseList(false, callback);
    }
  });

  //初始客户状态全部
  $scope.state = "";
  //初始客户类型全部
  $scope.type = "";
  //客户状态,客户类型改变的回调
  var valueChanged = function(to, from){
    if(to != undefined && to != from){
      GetBaseList(true);
    }
  };
  $scope.$watch("state", valueChanged);
  $scope.$watch("type", valueChanged);
  /**
   * 获取列表
   * @param {Boolean} isReload true表示重新加载,false表示累计加载
   */
  var GetBaseList = function(isReload, callback){
    $scope.isLoading = true;
    //如果是重新加载先清空列表,重置页码
    if(isReload){
      pIndex = 0;
      pSize = 10;
      $scope.list = [];
      lazyload.watch();
    }
    else{
      pIndex += 1;
    }
    serverSvc.GetBaseList({
      StateID: $scope.state,
      PropertyTypeID: $scope.type,
      pageIndex: pIndex,
      pageSize: pSize,
      UserID: $rootScope.userInfo.ID
    }, function(res) {
      if(res.status){
        if(callback){
          var neesContinue = res.result.pageCount > pIndex + 1;
          callback(neesContinue);
        }
        $scope.list = $scope.list.concat(res.result.Info);
      }
      else{
        if(callback){
          callback(false);
        }
      }
      $scope.isLoading = false;
    });
  };

  //如果收到userInfo代表已经加载完毕
  if($rootScope.userInfo){
    GetBaseList(true);
  }
  else{
    $scope.isLoading = true;
    /**
     * 监听全局控制器的初始化结束
     */
    $scope.$on("globalInited", function(event){
      GetBaseList(true);
    });
  }
  //设置listpanel的最大高度
  angular.element(document.getElementById("listBody")).css("height", window.innerHeight - 156 + "px");

  /**
   * 点击进入详情
   */
  $scope.getBaseInfo = function(baseid, propertyid) {
    switch (propertyid) {
      case 1:
        window.location.href = "saleDetailA.html?BaseID=" + baseid;
        break;
      case 2:
        window.location.href = "lendDetailA.html?BaseID=" + baseid;
        break;
      case 3:
        window.location.href = "buyDetailA.html?BaseID=" + baseid;
        break;
      case 4:
        window.location.href = "borrowDetailA.html?BaseID=" + baseid;
        break;
    }
  }

  /**
   * 客户状态
   */
  $scope.states = config.CusStates;

  /**
   * 客户类型
   */
  $scope.types = config.CusTypes;

}]);