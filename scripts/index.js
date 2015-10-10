/**
 * 说明:首页
 * 作者:lihao
 * 时间:2015-7-24
 */
angular.module('app', ['mdGlobal', 'mdServer', 'w5c.validator'])
.config(['w5cValidatorProvider', function(w5cValidatorProvider) {
  // 全局配置
  w5cValidatorProvider.config({
    blurTrig: false,
    showError: false,
    removeError: false
  });
  w5cValidatorProvider.setRules({
    UserName: {
      required: "输入的客户姓名不能为空",
      pattern: "客户姓名不能超过4个汉字"
    },
    UserPhone: {
      required: "手机号不能为空",
      pattern: "您输入的不是正确的手机号",
      w5cuniquecheck: "输入手机号已经存在，请重新输入"
    },
    Pwd: {
      required: "密码不能为空",
    },
    RepeatPwd: {
      required: "重复密码不能为空",
      repeat: "两次密码输入不一致"
    }
  });
}])
//注册控制器
.controller("ctrl", ["$rootScope", "$scope", "weixinSvc", "serverSvc", "queryStringSvc", function($rootScope, $scope, weixinSvc, serverSvc, queryStringSvc) {  
  /**
   * 如果存在用户并且是客户经理就跳转到workshop.html
   */
  var checkType1 = function(){
    if($rootScope.userInfo && $rootScope.userInfo.UserType == 2){
      window.location.href = "workshop.html";
    }
  }
  //如果收到userInfo代表已经加载完毕
  if($rootScope.userInfo){
    checkType1();
  } 
  else{
    $scope.isLoading = true;
    /**
     * 监听全局控制器的初始化结束
     */
    $scope.$on("globalInited", function(event, needRigist){
      checkType1();
      $scope.isLoading = false;
      if(page == 6){
        $scope.gotoUserCenter(false);
      }
    });
  }
  
  var page = queryStringSvc.get("p") || 1;

  //用户微信头像
  $scope.headimgurl = window.headimgurl || 'images/user.jpg';
  //用户微信昵称
  // $scope.nickname = window.nickname;

  /**
   * 跳转注册
   */
  var goRigist = function(){
    //注册信息初始化
    $scope.registInfo = {
      //用户类型
      UserType: 1,
      //片区{1:南湖, 2:汉阳}
      RegionID: 2
    }
    $rootScope.goto(3);
  }

  /**
   * 页面跳转
   */
  $scope.redirect = function(url){
    if($rootScope.userInfo){
      window.location.href = url;
    }
    else{
      goRigist();
    }
  }

  /**
   * 用户中心点击
   */
  $scope.gotoUserCenter = function(animate){
    //如果用户存在,跳到个人中心
    if($rootScope.userInfo){
      $scope.isLoading = true;
      serverSvc.GetUserInfoByID($rootScope.userInfo.ID, function(res){
        $scope.userInfo = angular.extend({}, $rootScope.userInfo, res.result.Info);
        $scope.isLoading = false;
      });
      $rootScope.goto(6, animate);
    }
    //如果不存在,跳到注册
    else{
      goRigist();
    }
  };

  $rootScope.show(page);

  /**
   * 注册时的下一步
   */
  $scope.registerNext = function() {
    //如果是社区顾问跳转page4
    if($scope.registInfo.UserType == 1){
      $rootScope.goto(4);
    }
    //如果是客户经理跳转page5
    else if($scope.registInfo.UserType == 2){
      $rootScope.goto(5);
    }
  };
  /**
   * 提交注册
   */
  $scope.register = function() {
    if($scope.registInfo.UserType == 1){
      if($scope.a_isAgree){
        $scope.errorMsg = '';
        $scope.isLoading = true;    
        serverSvc.UserReg(angular.extend({}, $scope.registInfo, {OpenID: openid}), function(res){
          $scope.isLoading = false;
          if(res.status){
            alert(res.result.message);
            $rootScope.userInfo = res.result.Info;
            $rootScope.goto(1);
          }
          else{
            $scope.errorMsg = res.result;
          }
        });
      }
      else{
        $scope.errorMsg = '请先阅读并同意《社区顾问注册协议》';
      }
    }
    else if($scope.registInfo.UserType == 2){
      $scope.errorMsg = '';
      $scope.isLoading = true;    
      serverSvc.UserReg(angular.extend({}, $scope.registInfo, {OpenID: openid}), function(res){
        $scope.isLoading = false;
        if(res.status){
          alert(res.result);
          window.location.href = "workshop.html";
        }
        else{
          $scope.errorMsg = res.result;
        }
      });
    }
  };

  /**
   * 登录
   */
  $scope.login = function() {
    
  };

  /**
   * 修改密码
   */
  $scope.savePwd = function(){
    $scope.errorMsg = '';
    $scope.isLoading = true;
    serverSvc.UpdatePwd(angular.extend({}, $scope.Modify, {UserID: $scope.userInfo.ID}), function(res){
      $scope.isLoading = false;
      if(res.status){
        $scope.Modify = {};
        alert("密码修改成功");
        $rootScope.goto(6);
      }
      else{
        $scope.errorMsg = res.result;
      }
    });
  }


}])


