// 站点配置
export interface SiteConfig {
  hosts: string, // 域名
  siteName: string, // 网站名称
  siteRoot: string, // 站点根目录
  beian?: string, // 备案号
  logo?: string, // 网站logo
  copyright: [string, string], // [start, end]
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
  listDoc: string // 目录说明文档
}

// 模型
export enum ModelTypes {
  Home = 'home', // 首页
  Normal = 'normal', // 文章
  Single = 'single', // 单页: 如关于我们
  Tags = 'tags', // 标签
  Collection = 'collection', // 文集
  Timeline = 'timeline' // 时光轴
}

// gulp插入文档格式
export interface GulpFileItem {
  path: string,
  contents: string
}

// 时间轴配置
export interface TimelineItem {
  publishDate: number,
  title: string,
  desc: string,
  link: string,
  image: string
}

// 推荐类型
export enum recommendTypes {
  Default = 0,
  Home = 1,
  Aside = 2
}

// 文档标签导航
export interface MarkdownNavigation {
  tag: string,
  slug: string,
  title: string
}

// Markdown文档配置
export interface MarkdownAttribute {
  mode: ModelTypes,
  title: string,
  publishDate: number,
  order: number,
  icon?: string,
  keywords?: string[],
  desc?: string,
  recommend?: recommendTypes,
  cover?: string,
  timeline?: TimelineItem[]
}

// 解析后的数据
export interface MarkdownParseAttribute extends MarkdownAttribute {
  id: string,
  pid: string,
  path: string,
  paths: string[],
  body: string,
  navigation: MarkdownNavigation[],
  children?: MarkdownParseAttribute[]
}

// 排序字段
export interface SortsItem {
  order: number,
  publishDate: number
}

// 下标取值
export const getProperty = <T, K extends keyof T>(o: T, name: K): T[K] => {
  return o[name];
};

// 文字链接
export interface TempTextLink {
  title: string,
  path: string,
  icon?: string
}

// 图片链接
export interface TempImageLink {
  title: string,
  path: string,
  cover: string,
  count?: number
}

// 分页数据
export interface PageItem {
  title: string | number,
  path: string,
  disabled?: boolean,
  isCurrent?: boolean,
}

// 文章列表
export interface TempListItem {
  title: string,
  path: string,
  desc: string,
  parent: {
    title: string,
    path: string
  },
  publishDate: string,
  keywords: {
    title: string,
    path: string
  }[],
  cover?: string
}

// 静态资源格式
export interface AssetsItem {
  scripts: string[],
  styles: string[],
}

// 模板变量
export interface TempHead {
  title: string,
  keywords: string,
  desc: string,
  styles: string[]
}
export interface TempHeader {
  current: number,
  list: TempTextLink[]
}
export interface TempTreeItem extends TempTextLink {
  children: TempTreeItem[]
}
export interface TempTree {
  current: string,
  list: TempTreeItem[]
}
export interface TempBreadcrumb {
  home: string,
  list: TempTextLink[]
}
export interface TempFooter {
  copyright: [string, string],
  hosts: string,
  beian: string
}
export interface TempAside {
  list: TempImageLink[],
  textList: TempTextLink[],
  tags: TempTextLink[]
}
export interface TempFoot {
  scripts: string[]
}
// 关键字
export interface TagsItem {
  title: string,
  path: string,
  count: number
}
