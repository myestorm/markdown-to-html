# markdown-to-html

利用gulp，本地markdown文档生成网站

## 使用方式

```sh
npm run serve // 查看本地服务
npm run build // 生成站点
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
---
markdown 正文
建议不使用一集标题 `#` title已经代替相应的功能
```

## 目录 readme 格式

每个目录下都必须有一个readme.md的文件来配置分类的属性

``` markdown
---
title: 标题
keywords: [关键字, ...]
desc: 简单描述
order: 排序[数字 越小越靠前]
---
```

## 文件处理的小惊喜

- 支持中文目录，生成对应的拼音作为目录
- 文件名含有排序信息，如 `1. 学习的第一天` 中 `1.` 不会出现在标题中

## 已知问题

- 非终极目录不支持放文档，终极目录是指，该文件夹下没有任何子目录

## 演示站点

[https://www.totonoo.com](https://www.totonoo.com)
