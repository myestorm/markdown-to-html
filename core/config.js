const config = {
  host: '/', // 网站
  sitename: 'totonoo 前端笔记', // 站点名称
  beian: '粤ICP备12041241号', // 备案号
  www: 'www', // 站点根目录
  assets: 'assets', // 静态资源目录
  data: 'data', // 数据存储目录
  documents: 'documents', // markdown文档目录
  defaultMD: 'readme.md', // 目录的配置文件
  pageSize: 10, // 列表分页大小
  template: 'template', // 模板目录
  templateTypes: { // 模板类型
    home: { // 首页
      fileName: 'index.ejs'
    },
    tags: { // 标签
      fileName: 'tags.ejs'
    },
    search: { // 搜索
      fileName: 'search.ejs'
    },
    normal: { // 通用文档
      list: { // 列表页模板
        fileName: 'list.ejs',
        data: {}
      },
      article: { // 文档模板
        fileName: 'article.ejs',
        data: {}
      }
    },
    collection: { // 文集
      article: { // 文档模板
        fileName: 'article.ejs',
        data: {}
      }
    },
    timeline: { // 时间轴
      list: { // 列表页模板
        fileName: 'list.ejs',
        data: {}
      },
      article: { // 文档模板
        fileName: 'article.ejs',
        data: {}
      }
    },
    single: { // 单页面 如：关于我们
      list: { // 列表页模板
        fileName: 'list.ejs',
        data: {}
      },
      article: { // 文档模板
        fileName: 'article.ejs',
        data: {}
      }
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
    for(let i in arr){
      res = res[arr[i]]
    }
    return res
  }
}
module.exports = config
