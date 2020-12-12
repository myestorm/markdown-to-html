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

// asset config
export interface AssetsItem {
  scripts: string[],
  styles: string[],
}

// 文档配置
export interface DocConfig {
  root: string, // 文档 根目录
  listDoc: string, // 目录说明文档
  about: string, // 关于我们
  timeline: string // 时光轴
}

export enum ModelTypes {
  Home = 'home', // 首页
  Normal = 'normal', // 文章
  Single = 'single', // 关于我们或单页
  Tags = 'tags', // 标签
  Collection = 'collection', // 文集
  Timeline = 'timeline' // 时光轴
}

// 文档标签导航
export interface MarkdownNavigation {
  tag: string,
  slug: string,
  title: string
}

// MD文档的属性
export interface MarkdownAttribute {
  title: string,
  keywords: string[]
  desc: string,
  publishDate: number,
  order?: number | undefined,
  icon?: string,
  recommend: number | boolean,
  mode: ModelTypes,
  cover?: string,
  body: string,
  navigation?: MarkdownNavigation[]
}

// gulp插入文档格式
export interface AddFileItem {
  path: string,
  contents: string
}

// 文档树
export interface TreeNodeItem {
  path: string,
  paths: string[],
  parent: string,
  parents: string[],
  extname: string,
  isDirectory: boolean,
  children: TreeNodeItem[],
  content: MarkdownAttribute
}

export const getProperty = <T, K extends keyof T>(o: T, name: K): T[K] => {
  return o[name];
};
