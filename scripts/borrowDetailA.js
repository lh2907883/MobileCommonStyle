/**
 * 说明:社区顾问-租房详情页
 * 作者:lihao
 * 时间:2015-7-23
 */
var app = angular.module('app', ['mdGlobal']);
//注册控制器,依赖$scope和time模块
app.controller("ctrl", ["$rootScope","$scope", "serverSvc", "queryStringSvc" , "weixinSvc" , function($rootScope,$scope, serverSvc, queryStringSvc, weixinSvc) {
  var GetBaseInfoByID = function(){
    $scope.isLoading = true;
    var ids = queryStringSvc.get();
    serverSvc.GetBaseInfoByID({
      BaseID: ids.BaseID,
      UserID: $rootScope.userInfo.ID
    }, function(res) {
      $scope.isLoading = false;
      $scope.entity = res.result.Info;
      $scope.imglist = res.result.ImageList;
      $scope.statelist = res.result.statelist;
    });
  };

  //如果收到userInfo代表已经加载完毕
  if($rootScope.userInfo){
    GetBaseInfoByID();
  }
  else{
    $scope.isLoading = true;
    /**
     * 监听全局控制器的初始化结束
     */
    $scope.$on("globalInited", function(event){
      GetBaseInfoByID();
      // $scope.isLoading = false;
    });
  }
}]);