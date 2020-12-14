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

// timeline item
export interface TimelineItem {
  publishDate: number,
  publishDateDay?: string,
  publishDateTime?: string,
  title: string,
  desc: string,
  image: string,
  link: string
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
  timeline?: TimelineItem[]
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

// 分页数据
export interface PageItem {
  title: string | number,
  path: string,
  disabled?: boolean,
  isCurrent?: boolean,
}

// 关键字
export interface KeywordsItem {
  title: string,
  path: string
}

// 列表数据
export interface SearchListItem {
  path: string,
  parent: string,
  parentName: string,
  title: string,
  keywords: string,
  keywordsPath: KeywordsItem[],
  desc: string,
  publishDate: string,
  recommend: number,
  order: number
}

// 文集列表属性
export interface CollectionListItem {
  id: string,
  title: string,
  cover: string,
  path: string,
  isLast: boolean,
  count?: number
}

// 顶部菜单
export interface TopNavItem {
  path: string,
  title: string,
  icon?: string,
  id?: string,
  order?: number,
  publishDate?: number,
  children?: TopNavItem[]
}

// 右侧推荐文集
export interface CollectionRecommendItem {
  path: string,
  title: string,
  cover?: string
}

// 标签
export interface TagsItem {
  path: string,
  title: string,
  count: number
}

// 面包屑
export interface BreadcrumbItem {
  path: string,
  title: string
}

// 排序
export interface SortsItem {
  order: number,
  publishDate: number | string
}
