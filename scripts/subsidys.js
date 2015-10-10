/**
 * 说明:社区顾问-出售房源提交
 * 作者:lihao
 * 时间:2015-7-23
 */
var app = angular.module('app', ['mdGlobal', 'mdServer', 'mdLozyload']);
app.controller("ctrl", ["$rootScope", "$scope", "serverSvc", "lazyloadSvc", "config", function($rootScope, $scope, serverSvc, lazyloadSvc, config) {
  //页码(从0开始),页大小
  var pIndex, pSize;
  var lazyload = lazyloadSvc.init(angular.element(document.getElementById("listBody")), {
    onLazyload: function(callback) {
      GetBillRecordPageList(false, callback);
    }
  });

  /**
   * 获取列表
   * @param {Boolean} isReload true表示重新加载,false表示累计加载
   */
  var GetBillRecordPageList = function(isReload, callback) {
    $scope.isLoading = true;
    //如果是重新加载先清空列表,重置页码
    if (isReload) {
      pIndex = 0;
      pSize = 10;
      $scope.list = [];
      lazyload.watch();
    } else {
      pIndex += 1;
    }
    serverSvc.GetBillRecordPageList({
      UserID: $rootScope.userInfo.ID,
      pageIndex: pIndex,
      pageSize: pSize,
      recordCount: 0,
      pageCount: 0,
      strSort: "CreateTime desc"
    }, function(res) {
      if (res.status) {
        if (callback) {
          var neesContinue = res.result.pageCount > pIndex + 1;
          callback(neesContinue);
        }
        $scope.list = $scope.list.concat(res.result.Info);
      } else {
        if (callback) {
          callback(false);
        }
      }
      $scope.isLoading = false;
    });
  };

  //如果收到userInfo代表已经加载完毕
  if ($rootScope.userInfo) {
    GetBillRecordPageList(true);
  } else {
    $scope.isLoading = true;
    /**
     * 监听全局控制器的初始化结束
     */
    $scope.$on("globalInited", function(event) {
      GetBillRecordPageList(true);
    });
  }
  //设置listpanel的最大高度
  angular.element(document.getElementById("listBody")).css("height", window.innerHeight - 118 + "px");

  //注册控制器,依赖$scope
  /*app.controller("ctrl", ["$rootScope", "$scope", "serverSvc", "queryStringSvc" , "weixinSvc" , function($rootScope, $scope, serverSvc, queryStringSvc,weixinSvc) {
    var GetBillRecordPageList = function() {
        $scope.isLoading = true;
        serverSvc.GetBillRecordPageList({
          UserID: $rootScope.userInfo.ID,
          pageIndex: 0,
          pageSize: 10,
          recordCount: 0,
          pageCount: 0,
          strSort: "CreateTime desc"
        }, function(res) {
          $scope.isLoading = false;
          $scope.entity = res.result.Info;
        });
      }
      //如果收到userInfo代表已经加载完毕
    if ($rootScope.userInfo) {
      GetBillRecordPageList();
    } else {*/
  /**
   * 监听全局控制器的初始化结束
   */
  /*  $scope.$on("globalInited", function(event) {
      GetBillRecordPageList();
    });
  }*/
}]);