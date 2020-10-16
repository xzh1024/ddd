# iView-Admin template
[![build](https://img.shields.io/travis/iview/iview-admin.svg?style=flat-square)](https://travis-ci.org/iview/iview-admin)
[![vue](https://img.shields.io/badge/vue-2.5.2-brightgreen.svg?style=flat-square)](https://github.com/vuejs/vue)

## 当前版本：v1.0

`注：包含主要的目录结构及文件注释`

## Install
```
// Install dependencies
npm install
```
## Run
### Development
```
npm run serve
```
### Production(Build)
```
// Build
npm run build
```


## 文件目录结构及说明
```shell
├── public
	├── static  静态资源
	├── index.html  页面模板
├── dist  项目打包后目录
└──  src
	├── assets  images
	├── axios
	├── components  系统级组件
	├── libs  工具库
		├── js  js工具
	├── router  系统路由
	├── store  vuex状态管理
	├── views  vue页面
		├── module1
			├── module1-1
				├── components  页面级组件
				├── service
					├── api.js
					├── http.js
			├── module1-2
            	├── components  页面级组件
            	├── service
            		├── api.js
            		├── http.js
			└── module1-entry.vue
		├── module2
			├── components  页面级组件
            ├── service
                ├── api.js
                ├── http.js
            └── module2-entry.vue
├── vue.config.js  配置

```

## 规范
```
<!-- 展示模板 -->
<template>
    <div></div>
</template>
<script></script>
<style lang='less' scoped></style>

1.使用ES6风格编码源码
    定义变量使用let, 定义常量使用const
    使用export, import 模块化
2.组件 props 原子化
    提供默认值
    使用 type 属性校验类型
    使用 props 之前先检查该 prop 是否存在
3.避免 this.$parent
4.谨慎使用 this.$refs
5.无需将 this 赋值给 component 变量
6.调试信息 console.log(), debugger 使用完及时删除

```

## Links
- [TalkingData](https://github.com/TalkingData)
- [Vue](https://github.com/vuejs/vue)
- [Webpack](https://github.com/webpack/webpack)

## License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-present, iView
