const config = {
  host: '/', // 网站
  sitename: 'totonoo 前端笔记', // 站点名称
  beian: '粤ICP备12041241号', // 备案号
  www: 'www', // 站点根目录
  assets: 'assets', // 静态资源目录
  data: 'data', // 数据存储目录
  documents: 'documents', // markdown文档目录
  collection: 'collection', // 文集目录
  defaultMD: 'readme.md', // 目录的配置文件
  pageSize: 10, // 列表分页大小
  template: 'template', // 模板目录
  templateTypes: { // 模板类型
    home: { // 首页
      dir: 'index',
      index: 'index.ejs'
    },
    normal: { // 通用文档
      dir: 'normal',
      list: 'list.ejs',
      article: 'article.ejs'
    },
    tags: { // 标签
      dir: 'tags',
      index: 'index.ejs',
      list: 'list.ejs'
    },
    search: { // 搜索
      dir: 'search',
      index: 'index.ejs'
    },
    timeline: {
      dir: 'timeline',
      index: 'index.ejs'
    },
    single: {
      dir: 'single',
      index: 'index.ejs'
    },
    collection: { // 文集
      dir: 'collection',
      index: 'index.ejs',
      list: 'cover.ejs',
      article: 'article.ejs'
    }
  },
  markdownItAnchor: { // markdown 右侧导航配置
    level: 1,
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '¶'
  },
  get (key) {
    let res = config
    const arr = key.split('.')
    for (const i in arr) {
      res = res[arr[i]]
    }
    return res
  }
}
module.exports = config
