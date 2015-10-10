"use strict";
/**
 * 说明:基于angular的延时加载模块
 * 作者:lihao
 * 时间:2015-8-5
 * 依赖:angular.js, zepto.js
 */
angular.module('mdLozyload', [])
  /**
   * 延时加载服务,用于创建针对不同容器的延时加载对象
   */
  .factory('lazyloadSvc', ['$timeout', function($timeout){
    /**
     * 延时加载对象
     * @param  {[angular element]} ngEle [angular element]
     * @param  {[object]} options [配置信息]
     */
    var Lazyload = function(ngEle, options){
      this.ngEle = ngEle;
      this.options = angular.extend({}, Lazyload.option, options);
    };
    Lazyload.prototype = {
      /**
       * 监视ngEle的滚动条
       */
      watch: function(){
        var _this = this;
        var lastPosition = 0;
        var checkScroll = function(autoFlag){
          //由代码自动调用而非滚动条触发的情况下
          if(autoFlag === true){
            //如果滚动条出现了,并且位置处在末尾(能够再次触发延时加载),那么设置滚动条的位置,就让他在上次的位置
            this.scrollTop = lastPosition;
          }
          else{
            var scrollTop = this.scrollTop;
            var innerHeight = this.offsetHeight;
            var scrollHeight = this.scrollHeight;
            if(scrollTop >= scrollHeight - innerHeight - _this.options.watch){
                lastPosition = scrollTop;
                checkLoading();
            }
          }
        };
        //是否继续监视滚动条
        var readyWatch = true;
        /**
         * 完成加载数据后调用
         * @param  {[bool]} continueWatch [是否继续监视滚动条]
         */
        var loadFinish = function(continueWatch){
           if(!continueWatch){
              _this.ngEle.off("scroll");
            }
            checkScroll.call(_this.ngEle[0], true);
            readyWatch = continueWatch;
        }
        /**
         * 准备加载数据(滚动条到底时触发)
         */
        var checkLoading = function(){
          //正在loading的时候不应该再次触发loading
          if(readyWatch) {
            readyWatch = false;
            //调用控制器的加载数据方法
            load(loadFinish);
          }
        };

        /**
         * 加载数据
         * @param  {[function]} loadFinishCallback [加载完成后的回调方法,参数continueWatch:bool表示是否还有数据]
         */
        var load = function(loadFinishCallback){
          //给用户一点反应的时间
          $timeout(function(){
            _this.options.onLazyload(loadFinishCallback);
          },  _this.options.deferLoadingMs);
        };
        //重新绑定滚动条滚动事件
        _this.ngEle.off("scroll");
        _this.ngEle.on("scroll", checkScroll);
      },
      /**
       * 停止监视ngEle的滚动条
       */
      stopWatch: function(){
        _this.ngEle.off("scroll");
      }
    };
    Lazyload.option = {
      //选填:表示滚动条在离底端watch px的距离时触发延时加载(默认0px)
      watch: 0,
      //选填:当达到触发延时加载的条件时(也就是说滚动条滚动到了合适的位置,通常是最底部),停顿一段时间,给用户一个反应时间(默认300毫秒)
      deferLoadingMs: 300,
      /*必填:类型function(callback){},触发延迟加载时调用
         //通知lazyLoading继续监视是否触发延时加载,continueWatch是bool类型,表示是否继续监视(比如已经加载了所有数据就不用继续监视了)
         callback: function(continueWatch){}
      */
      onLazyload: undefined
    };

    return {
      /**
       * 创建并返回延时加载对象
       * @param  {[angular element]} ngEle [angular element]
       * @param  {[object]} options [配置信息]
       */
      init: function(ngEle, options){
        return new Lazyload(ngEle, options);
      }
    }
  }]);