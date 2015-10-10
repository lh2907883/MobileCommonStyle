/**
 * 说明:社区顾问-出售房源提交
 * 作者:lihao
 * 时间:2015-7-23
 */
var app = angular.module('app', ['mdGlobal', 'mdServer']);
//注册控制器,依赖$scope
app.controller("ctrl", ["$rootScope","$scope", "serverSvc", "queryStringSvc" , "weixinSvc" , function($rootScope,$scope, serverSvc, queryStringSvc,weixinSvc) {
  var GetBaseSubsidyFeeInfo = function() {
      $scope.isLoading = true;
      var BaseId = queryStringSvc.get('BaseID');
      serverSvc.GetBaseSubsidyFeeInfo({
        BaseID: BaseId
      }, function(res) {
        $scope.isLoading = false;
        $scope.InfoFee = res.result.InfoFee;
        $scope.CommitFee = res.result.CommitFee;
      });
    }
    //如果收到userInfo代表已经加载完毕
  if ($rootScope.userInfo) {
    GetBaseSubsidyFeeInfo();
  }else{
    $scope.isLoading = true;
    /**
     * 监听全局控制器的初始化结束
     */
    $scope.$on("globalInited", function(event) {
      GetBaseSubsidyFeeInfo();
    });
  }

  $scope.confirm = function() {
    window.location.href = "myCustomer.html";
  };
}]);