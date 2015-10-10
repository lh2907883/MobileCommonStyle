/**
 * 说明:客户经理-我的工作间
 * 作者:lihao
 * 时间:2015-8-6
 */
var app = angular.module('app', ['mdGlobal', 'mdServer', 'mdLozyload']);
//注册控制器,依赖$scope
app.controller("ctrl", ["$rootScope", "$scope", "serverSvc", "lazyloadSvc", "config", function($rootScope, $scope, serverSvc, lazyloadSvc, config) {
  //页码(从0开始),页大小
  var pIndex, pSize;
  var lazyload = lazyloadSvc.init(angular.element(document.getElementById("listBody")), {
    onLazyload: function(callback){
      GetBaseExtendList(false, callback);
    }
  });

  //初始客户状态全部
  $scope.state = "";
  //初始客户类型全部
  $scope.type = "";
  //客户状态,客户类型改变的回调
  var valueChanged = function(to, from){
    if(to != undefined && to != from){
      GetBaseExtendList(true);
    }
  };
  $scope.$watch("state", valueChanged);
  $scope.$watch("type", valueChanged);
  /**
   * 获取列表
   * @param {Boolean} isReload true表示重新加载,false表示累计加载
   */
  var GetBaseExtendList = function(isReload, callback){
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
    serverSvc.GetBaseExtendList({
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
    GetBaseExtendList(true);
  }
  else{
    $scope.isLoading = true;
    /**
     * 监听全局控制器的初始化结束
     */
    $scope.$on("globalInited", function(event){
      if($rootScope.userInfo){
        GetBaseExtendList(true);
      }
      else{
        $scope.isLoading = false;
      }
    });
  }
  //设置listpanel的最大高度
  angular.element(document.getElementById("listBody")).css("height", window.innerHeight - 82 + "px");

  /**
   * 点击进入详情
   */
  $scope.getBaseInfo = function(baseid, propertyid) {
    switch (propertyid) {
      case 1:
        window.location.href = "saleDetailM.html?BaseID=" + baseid;
        break;
      case 2:
        window.location.href = "lendDetailM.html?BaseID=" + baseid;
        break;
      case 3:
        window.location.href = "buyDetailM.html?BaseID=" + baseid;
        break;
      case 4:
        window.location.href = "borrowDetailM.html?BaseID=" + baseid;
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

app.filter('isComplete',function(){
  return function(updateinfo){
    return updateinfo == "待完善" ? "tag-dws tag-red" : "tag-wsg tag-blue";
  }
});
app.filter('isNew',function(){
  return function(islooked){
    if(!islooked){
      return 'tag-x tag-blue';
    }
  }
})
