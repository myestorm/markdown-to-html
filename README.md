# markdown-to-html

使用gulp、markdown-it、Typescript等，读取本地markdown文档生成静态网站，支持tags和搜索功能。

## 演示站点

[https://www.totonoo.com](https://www.totonoo.com)

## 最后

基本的流程就是，先把markdown文件转换成json文件，然后把json和模板结合起来。转换markdown用的是 `markdown-it`。其他更多依赖包请查看 `package.json` 。

开发这个原因是自己有一堆md文档笔记，想成弄一个网站，网上找了一圈，要么很难用懂，要么界面不喜欢，所以就自己动手了。其中有很多不足，但是“Done is better than perfect”。
