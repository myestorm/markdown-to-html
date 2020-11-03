# markdown-to-html

本地markdown文档生成纯静态网站。

- 支持文章和文集两种模式；
- 支持根据标签自动生成tag聚合页；
- 支持模糊全站搜索；
- 简单时光轴功能；
- 支持中文目录/标题，自动转拼音；
- 支持手机浏览。

## 运行环境

- node >= v12.19 请自行去node官网下载安装[https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- gulp >= v4.0.2 安装好node之后，全局安装gulp 执行`npm install -g gulp-cli`
- git 自行安装，可装可不装

## 安装和使用项目

依次执行

```sh
# 下载项目文件或者直接下载zip包解压（https://github.com/myestorm/markdown-to-html/archive/master.zip）
git clone https://github.com/myestorm/markdown-to-html.git

# 完成后进入项目目录
cd markdown-to-html

# 安装项目依赖包
npm install -d

# 生成静态网站
npm run build

# 启用本地http服务
npm run serve

# 浏览器访问 http://localhost:8080，即可查看生成后的站点
```

## 目录说明

```sh
|-- core # 主程序
|---- tasks
|---- utils
|---- config.js # 系统配置 （一般配置站点名称和备案号，其他自己试试）
|-- data # 将所有的md文档转换成json 目录与documents目录一致
|---- collection
|---- essay
|---- all.json # 所有的文档 用于搜索
|---- readme.json # 首页配置
|---- tags.json # 标签
|---- tree.json # 左侧菜单
|-- documents # 文档目录
|---- collection # 文集示例
|------ 五十年儿童文学名作
|-------- 金瓜儿银豆儿.md
|-------- ...
|-------- readme.md # 五十年儿童文学名作的配置
|------ readme.md # 文集首页配置
|---- essay # 文章示例
|------ 合集
|-------- 毕淑敏-提醒幸福.md
|-------- ...
|-------- readme.md # 合集的配置
|------ readme.md # essay的配置
|---- about.md # 关于我们的配置
|---- readme.md # 首页的配置
|---- timeline.md # 时光轴的配置
|-- template # 模板目录
|---- assets # 静态资源 css js 图片等
|---- collection # 文集模板
|------ article.ejs # 文集正文
|------ cover.ejs # 文集封面
|------ index.ejs # 文集列表
|---- components # 公共组件
|------ aside.ejs # 侧边栏
|------ breadcrumb.ejs # 面包屑
|------ footer.ejs # 底部
|------ head.ejs # head
|------ header.ejs # 头部
|------ pager.ejs # 分页
|------ scripts.ejs # 载入js
|---- index # 首页模板
|------ index.ejs
|---- normal # 文章
|------ article.ejs # 正文模板
|------ list.ejs # 列表模板
|---- search # 搜索模板
|------ index.ejs
|---- single # 通用单页模板 （关于我们）
|------ index.ejs
|---- tags # 标签模板
|------ index.ejs # 聚合页模板
|------ list.ejs # 标签文章列表模板
|---- timeline # 时光轴模板
|------ index.ejs
|---- config.json # 静态资源配置文件
|---- favicon.ico # 网站ico
|-- www
|---- assets # 与template一致
|---- collection # 与documents一致
|---- essay
|---- tags # 所有的标签页
|---- about.html # 关于我们
|---- all.json # 所有文章
|---- favicon.ico # 网站ico
|---- index.html # 首页
|---- search.html # 搜索
|---- timeline.html # 时光轴
|-- .editorconfig
|-- .eslintignore
|-- .eslintrc.js
|-- .gitignore
|-- gulpfile.js # gulp入口
|-- LICENSE
|-- package.json
|-- README.md
```

## 文档格式

``` markdown
---
title: 标题
keywords: [关键字, ...]
desc: 简单描述
order: 排序[数字 越小越靠前，相同则 publishDate 的倒序排序]
publishDate: 发布时间[2020-04-15 23:20:12]
recommend: 是否推荐到首页显示[true | false]
mode: 使用模型[collection | single] 默认为null
---
markdown 正文
建议不使用一级标题 `#` title已经代替相应的功能
```

## 目录 readme 格式

每个目录下都必须有一个readme.md的文件来配置分类的属性

``` markdown
---
title: 标题
keywords: [关键字, ...]
desc: 简单描述
cover: 文集封面，仅在 mode为 collection 有效
order: 排序[数字 越小越靠前]
mode: 使用模型[collection | single] 默认为null
---
```

## 文件处理的小惊喜

- 支持中文目录，生成对应的拼音作为目录
- 文件名含有排序信息，如 `1. 学习的第一天` 中 `1.` 不会出现在标题中

## 已知问题

- 非终极目录不支持放文档，终极目录是指，该文件夹下没有任何子目录

## 演示站点

[https://www.totonoo.com](https://www.totonoo.com)
