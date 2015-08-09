### 使用less按模块编写 ###

1. 页面基准字体大小10px, 其他字号按照在10px的基础上缩放
    
		//字体大小
		.font-size(@size) {
		  font-size: unit(@size, px);
		  font-size: unit((@size / @base-fs), rem);
		}

2. animate.less `页面切换的动画样式`

3. 模块划分	
	- 按钮 (`.btn` `.btn-primary` ...)
	- 表单 (`.form` `.form-static` `.form-edit`)
	- 布局 (`.layout`)
	- 标签 (`.tag`)
	- 页面标题 (`.title`)
	- 面板 (`.panel` `.content-panel` `.search-panel` `.list-panel`)
	- 全局公共样式模块

    
### 项目结构 ###
由于是公司项目,所以只能开源less和HTML,使用angular.js框架的脚本代码没有提供

页面是运行在微信环境下的,下载项目代码的朋友请把

		<script src="http://vplus.fdc.com.cn/weixinapi/home/GetToken/get_openid/?type=detail"></script>

去掉..