"use strict";
/**
 * 说明:基于angular全局脚本(在模块里面封装service,directive,filter)
 * 作者:lihao
 * 时间:2015-7-22
 * 依赖:angular.js, zepto.js, server.js
 */
var app = angular.module('mdGlobal', ['mdServer'])
  /**
   * 全局对象(常量)
   */
  .constant('config', {
    //客户状态
    CusStates: [
      { id: "", label: "全部", explain: "全部"},
      { id: 1, label: "待处理", explain: "提交于"},
      { id: 10, label: "处理中", explain: "处理中"},
      { id: 20, label: "有效", explain: "确认有效"},
      { id: 30, label: "无效", explain: "确认无效"},
      { id: 40, label: "已成交", explain: "成交"}
    ],
    //客户类型
    CusTypes: [
      { id: "", label: "全部"},
      { id: 1, label: "出售"},
      { id: 2, label: "出租"},
      { id: 3, label: "求购"},
      { id: 4, label: "求租"}
    ],
    //期望区域
    Regions: {
      1: '南湖中央花园',
      2: '汉阳'
    }
  })
  /**
   * 一个全局的控制器
   */
  .controller("global", ['$scope', '$rootScope', 'navigateSvc', 'serverSvc', function($scope, $rootScope, navigateSvc, serverSvc){
    //测试openid
    // if(typeof openid == 'undefined'){
    //   // window.openid = 'oXNovuPMKAStYg9j_FbW8IOd2b4p';
    //   window.openid = 'oXNovuEcA5w8hA3QzYAI9fjXl0XQ5';
    // }
    //获取到界面上的ng-init="userType"后
    $scope.$watch("userType", function(to, from){
      /**
       * 获取用户信息
       */
      serverSvc.GetUserExists(openid, function(res){
        //如果用户存在
        if(res.status){
          $rootScope.userInfo = res.result.Info;
          //如果用户进入的不是对应权限的页面
          if($scope.userType != undefined && $scope.userType != res.result.Info.UserType){
            //如果是社区顾问
            if($rootScope.userInfo.UserType == 1){
              gotoIndex();
            }
            //如果是客户经理
            else if($rootScope.userInfo.UserType == 2){
              if(!/^\/workshop.html$/i.test(window.location.pathname)){
                window.location.href = "workshop.html";
              }
            }
          }
          else{
            //广播通知子控制器初始化完毕
            $rootScope.$broadcast("globalInited");
          }
        }
        else if(res.result && (typeof res.result.Info) == "string"){
          alert(res.result.Info);
          $rootScope.$broadcast("globalInited");
        } 
        //如果不存在,跳到首页
        else{
          gotoIndex();
        }
      }, true);
    });
    //默认打开第一页
    $rootScope.pIndex = 1;
    /**
     * 跳转到首页
     */
    var gotoIndex = function(){
      //本身就在首页要通知首页用户未注册
      if(/^\/(index.html)?$/i.test(window.location.pathname)){
        $rootScope.$broadcast("globalInited", true);
      }
      //不在首页要跳转到首页
      else{
        window.location.href = "index.html";
      }
    }

    /**
     * 动画过度页面
     */
    $rootScope.goto = function(pIndex, animate) {
      if (animate === false) {
        $rootScope.show(pIndex);
      } else {
        if ($rootScope.pIndex != pIndex) {
          var isLeftSide = $rootScope.pIndex < pIndex;
          navigateSvc.navigate(angular.element(document.getElementById("page" + $rootScope.pIndex)),
            angular.element(document.getElementById("page" + pIndex)), isLeftSide);
          $rootScope.pIndex = pIndex;
        }
      }
    }
      /**
       * 直接展示页面
       */
    $rootScope.show = function(pIndex) {
      if ($rootScope.pIndex != pIndex) {
        angular.element(document.getElementById("page" + $rootScope.pIndex)).addClass("hide");
        angular.element(document.getElementById("page" + pIndex)).removeClass("hide");
        $rootScope.pIndex = pIndex;
      }
    }
    /**
     * 判断给定form下的element的value是否为空字符串,当等于''时返回true
     */
    $rootScope.isEmpty = function(form, name){
      return angular.element(window[form][name]).val() == "";
    }
    /**
     * 判断给定form下的element的value是否不是空字符串,当等于''时返回false
     */
    $rootScope.isNotEmpty = function(form, name){
      return angular.element(window[form][name]).val() != "";
    }
    /**
     * 拨打号码
     */
    $rootScope.phoneCall = function(phone){
      window.location.href = "tel:" + phone;
    }
  }])
  /**************************************************指令****************************************************/
  /**
   * 定义一个myFullscreen属性,表示element会设置一个min-height样式,值就是全屏高度 + myFullscreen属性值
   * 例如: 全屏高度480px, <div my-fullscreen="-78"></div> 最终会生成 <div my-fullscreen="-78" style="minx-height:402px;"></div>
   */
  .directive('myFullscreen', [function() {
    return function(scope, element, attr) {
      //10个像素差值
      var fsHeight = window.innerHeight;
      var diff = parseInt(attr.myFullscreen);
      if(diff){
        element.css({
          'min-height': fsHeight + diff + 'px'
        });
      }
    };
  }])
  /**
   * 点击效果
   */
  .directive('myPresseffect', ["$document", function($document) {
    $document.on("touchend", function(event) {
      $("[my-presseffect]").removeClass('press')
    });

    return function(scope, element, attr) {
      element.on("touchstart", function(event) {
        $(this).addClass('press');
      });
    };
  }])
  /**
   * 遮罩层
   */
  .directive('myLoading', [function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="load-wrap"><div class="shadow"></div><div class="loading"></div></div>',
    }
  }])
  /**
   * 自动联想
   */
  .directive('myAutocomplete', [function() {
    return {
      restrict: 'E',
      scope: {
        cbchoose: '='
      },
      controller: ['$scope', '$attrs', '$timeout', 'serverSvc', function($scope, $attrs, $timeout, serverSvc) {
        $scope.click = function(item) {
          if ($scope.cbchoose) {
            $scope.cbchoose(item);
          }
          $scope.sc = [];
        }
        var oldV, t;
        //延时500豪秒再触发请求
        this.setSource = function(v) {
          if (oldV != v) {
            oldV = v;
            if (t) {
              $timeout.cancel(t);
            }
            t = $timeout(function() {
              // $scope.cbsetsource(v);
              if (v.length >= 2) {
                //$scope.isLoading = true;
                serverSvc.GetHouseXQ(v, function(res) {
                  $scope.sc = res;
                  //$scope.isLoading = false;
                });
              } else {
                $scope.sc = [];
              }
            }, 500);
          }
        }
      }],
      link: function(scope, ele, attr, ctrl) {
        var element = ele[0];
        var t;
        var mm = '';
        if (attr.iptid) {
          angular.element(document.getElementById(attr.iptid)).on("focus", function() {
              //延时一秒后弹出是为了确保键盘先弹出
              window.setTimeout(function() {
                var offset = $(element).offset();
                window.scrollTo(0, offset.top);
              }, 1000);
            }).on("blur", function() {
              scope.sc = [];
            })
            //input, propertychange(IE内核)事件是选择中文后的事件
            .on("keyup input propertychange", function() {
              //先处理事件,再setSource
              ctrl.setSource(this.value);
            })
            //粘贴事件
            .on("paste", function() {
              var _this = this;
              //先处理事件,再setSource
              window.setTimeout(function() {
                ctrl.setSource(_this.value);
              }, 0);
            });
        }
      },
      transclude: true,
      template: '<div ng-transclude></div><ul class="autocomplete"><li ng-repeat="item in sc" ng-click="click(item)" ng-bind="item|getAddr"></li></ul>',
    }
  }])
  /**************************************************服务****************************************************/
  /**
   * 页面切换效果
   */
  .factory('navigateSvc', [function() {
    function doAnim(dom, anim) {
      dom
        .removeClass("slideInLeft slideInRight slideOutLeft slideOutRight animated hide")
        .addClass(anim + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
          angular.element(this).removeClass("slideInLeft slideInRight slideOutLeft slideOutRight animated");
          if (anim == "slideOutLeft" || anim == "slideOutRight") {
            angular.element(this).addClass("hide");
          }
        });
    };
    return {
      /**
       * 导航动画
       * @param  {[angularDom]}  domForm    [要隐藏的dom]
       * @param  {[angularDom]}  domTo      [要显示的dom]
       * @param  {Boolean} isLeftSide [是否为左侧滑动动画]
       */
      navigate: function(domForm, domTo, isLeftSide) {
        window.scrollTo(0, 0);
        if (isLeftSide) {
          doAnim(domForm, "slideOutLeft");
          doAnim(domTo, "slideInRight");
        } else {
          doAnim(domForm, "slideOutRight");
          doAnim(domTo, "slideInLeft");
        }
      },
    };
  }])
  /**
   * 获取url参数
   */
  .factory('queryStringSvc', [function() {
    var regex = /[?&][^&]+/ig;
    var regexItem = /^[?&]([^=]+)[=]([^&]+)$/i;
    var ms = window.location.href.match(regex);
    var qs = {};
    if (ms) {
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i].match(regexItem);
        if (m) {
          qs[m[1]] = decodeURIComponent(m[2]);
        }
      }
    }
    return {
      /**
       * 获取url指定参数
       * @param  {[string]} name [参数名字,如果不传获取所有参数]
       */
      get: function(name) {
        if (name == undefined) {
          return qs;
        } else {
          return qs[name];
        }
      }
    };
  }])
  /************************************************provider****************************************************/
  /**
   * 微信接口封装
   */
  .provider('weixinSvc', [function() {
    // /**
    //  * 检测微信客户端版本
    //  */
    var checkSupport = function() {
      var m = window.navigator.userAgent.match(/MicroMessenger\/([\d]+[.][\d]+)/i);
      if (m) {
        var version = m[1];
        try {
          var fv = parseFloat(version);
          if (fv <= 6.1) {
            alert("您的微信客户端版本太低了,请升级客户端后再试试:)");
          }
        } catch (e) {}
      }
      return false;
    }
    checkSupport();
    /**
     * 微信接口是否ready
     */
    var inited = false;
    /**
     * 分享参数
     */
    var shareConfig = {};
    /**
     * 设置分享参数
     */
    this.setShareConfig = function(config) {
      shareConfig = config;
    };

    /**
     * service获取实例入口.依赖注入$http
     */
    this.$get = ['$http', function($http) {
      /**
       * 接口初始化
       */
      $http.get('http://vplus.fdc.com.cn/weixinapi/Home/GetToken/get_jssdk_config?acid=44')
        .success(function(res) {
          wx.config({
            // debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: res.data.appId, // 必填，公众号的唯一标识
            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
            signature: res.data.signature, // 必填，签名，见附录1
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice', 'chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'translateVoice', 'getNetworkType', 'openLocation', 'getLocation', 'hideOptionMenu', 'showOptionMenu', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'showAllNonBaseMenuItem', 'closeWindow', 'scanQRCode', 'chooseWXPay', 'openProductSpecificView', 'addCard', 'chooseCard', 'openCard'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          });
          //初始化错误
          wx.error(function(res) {
            alert(JSON.stringify(res));
            // alert("初始化错误,请稍后再试:)");
          });
          wx.ready(function(res) {
            inited = true;
            // wx.checkJsApi({
            //   jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo','startRecord','stopRecord','onVoiceRecordEnd','playVoice','pauseVoice','stopVoice','onVoicePlayEnd','uploadVoice','downloadVoice','chooseImage','previewImage','uploadImage','downloadImage','translateVoice','getNetworkType','openLocation','getLocation','hideOptionMenu','showOptionMenu','hideMenuItems','showMenuItems','hideAllNonBaseMenuItem','showAllNonBaseMenuItem','closeWindow','scanQRCode','chooseWXPay','openProductSpecificView','addCard','chooseCard','openCard'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
            //   success: function(res) {
            //     //debug.log(res);
            //     // 以键值对的形式返回，可用的api值true，不可用为false
            //     // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
            //   }
            // });
            //
            //分享到朋友圈
            wx.onMenuShareTimeline(shareConfig);
            //分享给朋友
            wx.onMenuShareAppMessage(shareConfig);
            //分享到QQ
            wx.onMenuShareQQ(shareConfig);
            //分享到腾讯微博
            wx.onMenuShareWeibo(shareConfig);
            //分享到QQ空间
            wx.onMenuShareQZone(shareConfig);
          });
        });
      /**
       * service实例
       */
      return {
        /**
         * 选择图片
         */
        chooseImage: function(callback) {
          if (inited) {
            wx.chooseImage({
              success: function(res) {
                if (callback) {
                  callback(res.localIds);
                }
              },
              error: function(res) {
                alert(JSON.stringify(res));
              }
            });
          }
        },
        /**
         * 微信单个图片上传
         * @param  {[string]}   localId  [图片本地Id]
         */
        uploadImage: function(localId, callback){
          if(inited){
            wx.uploadImage({
              localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
              isShowProgressTips: 1, // 默认为1，显示进度提示
              success: function (res) {
                if(callback){
                  // 返回图片的服务器端ID
                  callback(res.serverId);
                }
              }
            });
          }
        },
        /**
         * 微信多个图片上传
         * @param  {[array]}   localIdList [一组图片本地Id]
         */
        uploadImageList: function(localIdList, callback){
          var i = 0,
              _this = this,
              serverImgList = [];
          if(localIdList.length > 0){
            var cb = function(serverId){
              serverImgList.push(serverId);
              if(localIdList.length > i){
                _this.uploadImage(localIdList[i++], cb);
              }
              else if(callback){
                callback(serverImgList);
              }
            };
            _this.uploadImage(localIdList[i++], cb);
          }
        }
      }
    }];
  }])
  /************************************************过滤器****************************************************/
  /**
   * 获取转换地址
   */
  .filter('getAddr', function() {
    return function(item) {
      return (item.fname + ',' + item.fadd).slice(0, 30);
    };
  })
  .filter('getPropertyType',function(){
    return function(propertyid,type){
      if(type == "title"){
        switch(propertyid){
          case 1:
            return  "房源出售"
          case 2:
            return  "房源出租"
          case 3:
            return  "购房客户"
          case 4:
            return  "租房客户"
          default:
            return  "";
        }
      }else{
        switch(propertyid){
          case 1:
            return  "tag-cs"
          case 2:
            return  "tag-cz"
          case 3:
            return  "tag-qg"
          case 4:
            return  "tag-qz"
          default:
            return  "";
        }
      }
    }
  })
  /**
   * 根据StatusID获取房源状态
   */
  .filter('getType', function() {
    return function(statusid) {
      switch (statusid) {
        case 1:
          return "提交于";
        case 10:
          return "处理中";
        case 20:
          return "有效房源";
        case 30:
          return "无效房源";
        case 40:
          return "已成交";
        default:
          return "";
      }
    };
  })
  /**
   * 根据StatusID获取房源状态
   */
  .filter('getStatusClass', function() {
    return function(statusid, type, typeM) {
      if(type == "user"){
        if(statusid == 30){
          return 'co-gray';
        }
        else{
          return 'co-primary';
        }
      }
      else if(type == "flag"){
        switch (statusid) {
          case 1:
            return 'co-primary';
          case 10:
            return 'co-primary';
          case 20:
            return 'co-primary';
          case 30:
            return 'co-gray';
          case 40:
            return 'co-warn';
          default:
            return '';
        }
      }
      else if(type == "tag"){
        if(typeM == "tagM"){
          switch (statusid) {
            case 1:
              return 'tag-red tag-qcl';
            case 10:
              return 'tag-red tag-qcl';
            case 20:
              return 'tag-blue tag-yxfy';
            case 30:
              return 'tag-gray tag-ysx';
            case 40:
              return 'tag-blue tag-cj';
            default:
              return '';
          }
        }else {
          switch (statusid) {
            case 1:
              return 'tag-blue tag-clz';
            case 10:
              return 'tag-blue tag-clz';
            case 20:
              return 'tag-blue tag-yx';
            case 30:
              return 'tag-gray tag-wx';
            case 40:
              return 'tag-red tag-cj';
            default:
              return '';
          }
        }
      }
    };
  })

  /**
   * 将传回的时间改成字符串
   */
  .filter('getDate', function(){
    return function(dateS){
      if(dateS){
        var reg = /[0-9]+/;
        var date = dateS.match(reg);
        return date ? date[0] : "";
      }
      else{
        return "";
      }
    }
  })
  .filter('stateDisplay', ["config", function(config){
    return function(target){
      var states = config.CusStates;
      for(var i in states){
        if(states[i].id == target){
          return states[i].explain;
        }
      }
      return "";
    }
  }])
  .filter('typeDisplay', ["config", function(config){
    return function(target){
      var types = config.CusTypes;
      for(var i in types){
        if(types[i].id == target){
          return types[i].label;
        }
      }
      return "";
    }
  }])
  .config(["$compileProvider", "weixinSvcProvider", function($compileProvider, weixinSvcProvider) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|http|wxlocalresource|weixin|tel):/);
    
    // title: '', // 分享标题
    // link: '',  // 分享链接
    // imgUrl: '',// 分享图标
    // desc: '', // 分享描述
    weixinSvcProvider.setShareConfig({
      title: "全民赚佣金，欢迎加入社区顾问",
      desc: "买房 卖房 租房 找房，一切尽在亿房。提交您身边的房源、客户信息，立刻赚取佣金吧~",
      imgUrl: 'http://' + window.location.host + '/images/share.jpg',
      link: 'http://' + window.location.host + '/index.html'
    });
  }]);
