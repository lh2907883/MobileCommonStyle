"use strict";
/**
 * 说明:基于angular全局脚本(在模块里面封装service,directive,filter)
 * 作者:lihao
 * 时间:2015-7-22
 * 依赖:angular.js, zepto.js
 */
angular.module('mdServer', [])
  /**
   * service配置信息
   */
  .constant('serverConfig', {
    //接口地址
    server: "http://192.168.1.214:1380/"
  })
  .config(['$httpProvider', function($httpProvider){
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
      /**
       * The workhorse; converts an object to x-www-form-urlencoded serialization.
       * @param {Object} obj
       * @return {String}
       */
      var param = function(obj) {
          var query = '';
          var name, value, fullSubName, subName, subValue, innerObj, i;

          for (name in obj) {
              value = obj[name];

              if (value instanceof Array) {
                  for (i = 0; i < value.length; ++i) {
                      subValue = value[i];
                      fullSubName = name + '[' + i + ']';
                      innerObj = {};
                      innerObj[fullSubName] = subValue;
                      query += param(innerObj) + '&';
                  }
              } else if (value instanceof Object) {
                  for (subName in value) {
                      subValue = value[subName];
                      fullSubName = name + '[' + subName + ']';
                      innerObj = {};
                      innerObj[fullSubName] = subValue;
                      query += param(innerObj) + '&';
                  }
              } else if (value !== undefined && value !== null) {
                  query += encodeURIComponent(name) + '='
                          + encodeURIComponent(value) + '&';
              }
          }

          return query.length ? query.substr(0, query.length - 1) : query;
      };

      return angular.isObject(data) && String(data) !== '[object File]'
              ? param(data)
              : data;
    }];
  }])
  /**
   * 转换对象
   */
  .filter('toJson', [function(){
    return function(data){
      if(typeof data == "object"){
          // data = data.d;
        data = JSON.stringify(data);
      }
      data = data.replace(/\\\\/g,'').replace(/\\"/g, '"').replace(/"{/g,'{').replace(/}"/g,'}').replace(/"\[/g,'[').replace(/\]"/g,']');
      // data = $.parseJSON(data);
      return angular.fromJson(data);
    }
  }])
  .factory('serverSvc', ['$http', '$filter', 'serverConfig', function($http, $filter, serverConfig){
    var post = function(url, data, callback){
      $http.post(serverConfig.server + url, data)
        .success(function(res){
          res = $filter('toJson')(res);
          if(callback){
            callback(res);
          }
        }).error(function(){
          alert("参数错误:(");
        });
    };
    /**
     * localStorage缓存,如果不传value表示获取,传value表示设置
     * @param  {[string]} key   [缓存的key]
     * @param  {[object]} value [缓存的value]
     */
    var cache = function(key, value){
      if(value == undefined){
        var str = localStorage[key];
        if(str == undefined){
          return undefined;
        }
        else{
          return JSON.parse(str);
        }
      }
      else{
        var v = JSON.stringify(value)
        localStorage[key] = v;
      }
    }

    return {
      /**
       * 检测用户是否存在
       * 输入: {UserID: 'openid'}
       * 返回: 用户信息对象
       * @param {[string]}   openid     [openid]
       */
      GetUserExists: function(openid, callback, isCache){
        var result;
        if(isCache && (result = cache('GetUserExists' + openid))){
          if(callback){
            callback(result);
          }
        }
        else{
          post('UserService.svc/GetUserExists', {UserID: openid}, function(res){
            res.status && isCache && cache('GetUserExists' + openid, res);
            if(callback){
              callback(res);
            }
          });
        }
      },
      /**
       * 获取用户信息
       * 输入: {UserID: 'xxxx'}
       * 返回: 用户信息对象
       * @param {[string]}   userId   [userId]
       */
      GetUserInfoByID: function(userId, callback, isCache){
        var result;
        if(isCache && (result = cache('GetUserInfoByID' + userId))){
          if(callback){
            callback(result);
          }
        }
        else{
          post('UserService.svc/GetUserInfoByID', {UserID: userId}, function(res){
            isCache && cache('GetUserInfoByID' + userId, res);
            if(callback){
              callback(res);
            }
          });
        }
      },
      /**
       * 用户注册
       * 输入: {UserName: '用户名', UserPhone: '电话', UserType: 1, RegionID: 2, District: '', OpenID: '', Pwd: ''}
       * 返回: 用户信息对象
       * @param {[object]}   data     [输入参数]
       */
      UserReg: function(data, callback){
        post('UserService.svc/UserReg', data, callback);
      },
      /**
       * 修改密码
       * 输入: {UserID: '用户ID', NewPwd: '新密码', OldPwd: '老密码'}
       * 返回: 用户信息对象
       * @param {[object]}   data     [输入参数]
       */
      UpdatePwd: function(data, callback){
        post('UserService.svc/UpdatePwd', data, callback);
      },
      /**
       * 获取地址自动联想
       */
      GetHouseXQ: function(input, callback){
        $http.post('http://appserver.fdc.com.cn/oldhouse/HouseServiceExtend.svc/GetHouseXQ', {
          xqkey: input,
          pindex: 1,
          psize: 10
        }).success(function(res){
          res = $filter('toJson')(res);
          if(callback){
            callback(res.result.List);
          }
        });
      },
      /**
       * [GetBaseInfoByID description]
       * @param {[type]}   data     [description]
       * @param {Function} callback [description]
       */
      GetBaseInfoByID: function(data, callback){
        post('HouseInfo.svc/GetBaseInfoByID', data, function(res){
          if(callback){
            callback(res);
          }
        });
      },
      /**
       * 添加房源信息
       * 输入：房源信息提交数据
       * 返回：是否提交成功
       * @param {[type]}   data     [PropertyID：1（出售） 2（出租） 3（求购） 4（求租）]
       * @param {Function} callback [description]
       */
      BaseInfoAdd: function(data,callback){
        post('HouseInfo.svc/BaseInfoAdd',data,callback);
      },

      /**
       * 根据房源编号获取补助费信息
       * 输入：楼盘编号
       * 返回：补助费JSON
       * @param {[type]}   data     [BaseID:楼盘编号]
       * @param {Function} callback [description]
       */
      GetBaseSubsidyFeeInfo: function(data,callback){
        post('HouseInfo.svc/GetBaseSubsidyFeeInfo',data,callback);
      },

      /**
       * 社区顾问-用于我的客户页获取客户列表
       * 输入：页面索引：pageIndex  页面列表个数：pageSize  用户编号：UserID
       * 返回：客户信息
       * @param {[type]}   data   pageIndex: 1,pageSize: 4,UserID: 'e0b9ebd5-fd8d-4896-9232-d3fa4b4e06bc'
       * @param {Function} callback [description]
       */
      GetBaseList: function(data,callback){
        post('HouseInfo.svc/GetBaseList',data,callback);
      },

      /**
       * 客户经理-用于我的工作间获取客户列表
       * 输入：页面索引：pageIndex  页面列表个数：pageSize  用户编号：UserID
       * 返回：客户信息
       * @param {[type]}   data   pageIndex: 1,pageSize: 4,UserID: 'e0b9ebd5-fd8d-4896-9232-d3fa4b4e06bc'
       * @param {Function} callback [description]
       */
      GetBaseExtendList: function(data,callback){
        post('HouseInfo.svc/GetBaseExtendList',data,callback);
      },

      /**
       * 根据区域得到街道信息
       * 输入：区域ID：RegionID
       * 输出：区域的街道信息
       * @param {[type]}   regionID     [区域ID]
       */
      GetRegion: function(regionID,callback,isCache){
        var result;
        if(isCache && (result = cache('GetRegion' + regionID))){
          if(callback){
            callback(result);
          }
        }
        else{
          post('HouseInfo.svc/GetRegion', {RegionID: regionID}, function(res){
            isCache && cache('GetRegion' + regionID, res);
            if(callback){
              callback(res);
            }
          });
        }
      },

      /**
       * 补助发放记录
       * @param {[type]}   data     [description]
       * @param {Function} callback [description]
       */
      GetBillRecordPageList: function(data,callback){
        post('UserService.svc/GetBillRecordPageList',data,callback);
      },

      /**
       * 客户经理获得房源详情
       * @param {[type]}   data     [description]
       * @param {Function} callback [description]
       */
      GetBaseExtendInfoByID: function(data,callback){
        post('HouseInfo.svc/GetBaseExtendInfoByID',data,callback);
      },

      /**
       * 客户经理改变状态
       * 输入：BaseID: BaseID, 改编后的状态ID：StatusID
       * 输出：区域的街道信息
       * @param {[type]}   data     [description]
       * @param {Function} callback [description]
       */
      UpdateBaseStatus: function(data,callback){
        post('HouseInfo.svc/UpdateBaseStatus',data,callback);
      },

      /**
       * 客户经理完善提交
       * @param {[type]}   data     [description]
       * @param {Function} callback [description]
       */
      UpdateBaseExtendInfo: function(data,callback){
        post('HouseInfo.svc/UpdateBaseExtendInfo',data,callback);
      }
    };
  }])
