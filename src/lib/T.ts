// 文档yaml参数
export interface MarkdownParams {
  title: string, // 标题
  keywords: string[], // 关键字
  desc: string, // 描述
  publishDate: number, // 发布时间
  recommend: boolean, // 首页推荐
  cover?: string, // 头图
  body: string, // 正文
  nav?: MarkdownTitleNav[], // 右侧文章导航
  mode: ModelTypes // 模型
}

// 文档树
export interface TreeNodeItem {
  path: string,
  paths: string[],
  parent: string,
  parents: string[],
  extname: string,
  isDirectory: boolean,
  order: number,
  children: TreeNodeItem[],
  content: MarkdownParams
}

// 文档导航
export enum TitleTags {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6'
}
// 文档标签导航
export interface MarkdownTitleNav {
  tag: string,
  slug: string,
  title: string
}

// 站点配置
export interface SiteConfig {
  hosts: string, // 域名
  siteName: string, // 网站名称
  siteRoot: string, // 站点根目录
  beian?: string, // 备案号
  logo?: string, // 网站logo
  copyright: [string, string],
  favicon?: string // favicon
}

// 模板配置
export interface TemplateConfig {
  root: string, // 模板 根目录
  config: string, // 模板
  pageSize: number
}

// 文档配置
export interface DocConfig {
  root: string, // 文档 根目录
  listDoc: string, // 目录说明文档
  about: string, // 关于我们
  timeline: string // 时光轴
}

// model类型
export enum ModelTypes {
  Article = 'article',
  Single = 'single'
}

// 模板配置
export interface templateConfigItem {
  scripts: string[],
  styles: string[]
}

// 模板基础数据拆分
export interface pageDataInterface {
  head: {
    title: string,
    keywords: string,
    description: string,
    styles: string[]
  },
  body: {
    header: {
      topnav: [],
      current: number
    },
    main: {
    },
    footer: {
      beian: string,
      copyright: [string, string]
    },
    foot: {
      scripts: string[]
    }
  }
}
