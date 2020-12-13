import path from 'path';
import dayjs from 'dayjs';
import MarkdownToHtml from './MarkdownToHtml';
import Tree from './Tree';
import { ModelTypes, TreeNodeItem, getProperty, AssetsItem, PageItem, KeywordsItem, SearchListItem } from './Interfaces';

export interface TopNavItem {
  path: string,
  title: string,
  icon: string,
  children?: TopNavItem[]
}

export interface CollectionRecommendItem {
  path: string,
  title: string,
  cover?: string
}

export interface TagsItem {
  path: string,
  title: string,
  count: number
}

export interface BreadcrumbItem {
  path: string,
  title: string
}

class BaseModel {
  markdownToHtml: MarkdownToHtml;
  tree: Tree;
  topNav: TopNavItem[] = [];
  normalTree: TopNavItem[] = [];
  normalList: SearchListItem[] = [];
  searchList: SearchListItem[] = [];
  collectionRecommend: CollectionRecommendItem[] = [];
  normalRecommend: CollectionRecommendItem[] = [];
  tags: TagsItem[] = [];

  g = {
    $path: '',
    $hosts: ''
  };

  constructor (tree: Tree, markdownToHtml: MarkdownToHtml) {
    this.markdownToHtml = markdownToHtml;
    this.tree = tree;
    this.g = {
      $path: path.resolve(__dirname, `../../${this.markdownToHtml.config.templateConfig.root}`),
      $hosts: this.markdownToHtml.config.siteConfig.hosts
    };
    this.generateTopNav();
    this.generateNormalTree();
    this.generateSearchList();
    this.generateCollectionRecommend();
    this.generateNormalRecommend();
    this.generateTags();
    this.generateNormalList();
    // console.log(JSON.stringify(this.normalList, null, 4));
  }

  // 格式化时间
  formatDatetime (t: number): string {
    return dayjs(t).format('YYYY-MM-DD HH:mm');
  }

  // 面包屑
  getBreadcrumb (paths: string[]): BreadcrumbItem[] {
    const _paths = [ ... paths];
    if (paths.includes(this.tree.listDoc)) {
      _paths.pop();
    }
    const res: BreadcrumbItem[] = [];
    _paths.reduce((prev: string[], current) => {
      prev.push(current);
      const pItem = this.tree.findByPath(prev.join('/'));
      if (pItem) {
        const item = this.tree.getContent(pItem);
        res.push({
          path: this.mergerHosts(pItem.path),
          title: item ? (item.title || '') : ''
        });
      }
      return prev;
    }, []);
    return res;
  }

  // 拼接网站地址
  mergerHosts (path: string): string {
    return `${this.markdownToHtml.config.siteConfig.hosts}${path}`;
  }

  // 拼接模板地址
  mergeTemplatePath (template: string): string {
    return path.join(this.g.$path, template);
  }

  // 拼接网站标题
  mergeSiteTitle (title: string): string {
    const siteName = this.markdownToHtml.config.siteConfig.siteName;
    return title ? `${title} - ${siteName}` : siteName;
  }

  // 拼接assets
  mergeAssets (template: string): AssetsItem {
    const assets: AssetsItem = { ...this.markdownToHtml.config.templateConfigData[template] };
    const _assets: AssetsItem = {
      styles: [],
      scripts: []
    };
    assets.styles.forEach((item, index) => {
      item = `assets/${item}`;
      _assets.styles[index] = this.mergerHosts(item);
    });
    assets.scripts.forEach((item, index) => {
      item = `assets/${item}`;
      _assets.scripts[index] = this.mergerHosts(item);
    });
    return _assets;
  }

  checkIsNormalArticle (data: TreeNodeItem): boolean {
    let res = false;
    if (data.isDirectory === false && data.content.mode === ModelTypes.Normal && data.paths.includes(this.tree.listDoc) === false) {
      res = true;
    }
    return res;
  }

  checkIsArticle (data: TreeNodeItem): boolean {
    let res = false;
    if (data.isDirectory === false && data.paths.includes(this.tree.listDoc) === false) {
      res = true;
    }
    return res;
  }

  // 顶部导航菜单
  generateTopNav (): void {
    const list = this.tree.list;
    const res: TopNavItem[] = [];
    list.forEach(item => {
      const mode = this.tree.getMode(item);
      if (mode !== ModelTypes.Normal) {
        const content = this.tree.getContent(item);
        if (content) {
          res.push({
            path: this.mergerHosts(item.path === this.tree.listDoc ? '' : item.path),
            title: item.path === this.tree.listDoc ? '首页' : content.title,
            icon: content.icon || ''
          });
        }
      }
    });
    this.topNav = res;
  }

  // 左侧菜单
  generateNormalTree (): void {
    const tree: TopNavItem[] = [];
    const findChildren = (list: TreeNodeItem[], arr: TopNavItem[] = tree) => {
      list.forEach(item => {
        const mode = this.tree.getMode(item);
        const content = this.tree.getContent(item);
        if (item.isDirectory && mode === ModelTypes.Normal && content) {
          const _item = {
            path: this.mergerHosts(item.path === this.tree.listDoc ? '' : item.path),
            title: content.title,
            icon: content.icon || '',
            children: []
          };
          if (item.children && item.children.length > 0) {
            findChildren(item.children, _item.children);
          }
          arr.push(_item);
        }
      });
    };
    findChildren(this.tree.list, tree);
    this.normalTree = tree;
  }

  // 搜索数据所有的文章
  generateSearchList (): void {
    for (const [key, value] of this.tree.maps.entries()) {
      const mode = this.tree.getMode(value);
      if (this.checkIsArticle(value) && (mode === ModelTypes.Normal || mode === ModelTypes.Collection)) {
        let parentName = '';
        const parentItem = this.tree.findByPath(value.parent);
        if (parentItem) {
          const content = this.tree.getContent(parentItem);
          if (content?.title) {
            parentName = content.title;
          }
        }

        const keywordsPath: KeywordsItem[] = [];
        value.content.keywords.forEach((keyword: string) => {
          keywordsPath.push({
            title: keyword,
            path: this.markdownToHtml.pinYin(keyword)
          });
        });

        this.searchList.push({
          path: this.mergerHosts(key),
          parent: this.mergerHosts(value.parent),
          parentName,
          title: value.content.title,
          keywords: value.content.keywords.join(', '),
          keywordsPath,
          desc: value.content.desc,
          publishDate: this.formatDatetime(value.content.publishDate),
          recommend: value.content.recommend,
          order: value.content.order
        });
      }
    }
  }

  // 右侧文集推荐 Collection list && Recommend = 1
  generateCollectionRecommend (): void {
    this.tree.maps.forEach(value => {
      if (!value.isDirectory && value.paths.includes(this.tree.listDoc) && value.content.mode === ModelTypes.Collection && value.content.recommend === 1) {
        this.collectionRecommend.push({
          path: this.mergerHosts(value.parent),
          title: value.content.title,
          cover: value.content.cover
        });
      }
    });
  }

  // 右侧文章推荐 normal && Recommend = 2
  generateNormalRecommend (): void {
    this.tree.maps.forEach(value => {
      if (this.checkIsNormalArticle(value) && value.content.recommend === 2) {
        this.normalRecommend.push({
          path: this.mergerHosts(value.path),
          title: value.content.title
        });
      }
    });
  }

  // 所有的tags
  generateTags (): void {
    interface TOB {
      [index: string]: TagsItem
    }
    const tags: TOB = {};
    this.tree.maps.forEach(value => {
      if (this.checkIsArticle(value)) {
        const keywords: string [] = value.content.keywords;
        keywords.forEach(keyword => {
          const key = this.markdownToHtml.pinYin(keyword);
          const _key = getProperty<TOB, string>(tags, key);
          if (_key) {
            _key.count ++;
          } else {
            tags[key] = {
              path: this.mergerHosts(`tags/${key}.html`),
              title: keyword,
              count: 1
            };
          }
        });
      }
    });
    Object.keys(tags).forEach(tag => {
      this.tags.push(tags[tag]);
    });
    // 排序
    this.tags.sort((a, b) => {
      return b.count - a.count;
    });
  }

  // 所有normal文章
  generateNormalList (): void {
    this.tree.maps.forEach(value => {
      if (this.checkIsNormalArticle(value)) {
        let parentName = '';
        const parentItem = this.tree.findByPath(value.parent);
        if (parentItem) {
          const content = this.tree.getContent(parentItem);
          if (content?.title) {
            parentName = content.title;
          }
        }
        const keywordsPath: KeywordsItem[] = [];
        value.content.keywords.forEach((keyword: string) => {
          keywordsPath.push({
            title: keyword,
            path: this.markdownToHtml.pinYin(keyword)
          });
        });
        this.normalList.push({
          title: value.content.title,
          path: this.mergerHosts(value.path),
          parent: this.mergerHosts(value.parent),
          parentName,
          keywords: value.content.keywords.join(', '),
          keywordsPath,
          desc: value.content.desc,
          publishDate: this.formatDatetime(value.content.publishDate),
          recommend: value.content.recommend,
          order: value.content.order
        });
      }
    });
  }

  // 分页数据
  listPages (total = 0, pagesize = 10, filename = 'index', ext = '.html'): PageItem[][] {
    const pages: PageItem[][] = [];
    const pageCount = Math.ceil(total / pagesize);
    const sizes = 2;
    for (let i = 1; i <= pageCount; i++) {
      let item: PageItem[] = [];
      const prev = {
        title: '上一页',
        path: i - 1 === 1 ? `${filename}${ext}` : `${filename}_${i - 1}${ext}`,
        disabled: (i === 1)
      };
      const next = {
        title: '下一页',
        path: `${filename}_${i + 1}${ext}`,
        disabled: (i === pageCount)
      };
      const center: PageItem[] = [];

      item.push(prev);

      for (let j = 1; j <= pageCount; j++) {
        center.push({
          title: j,
          path: j === 1 ? `${filename}${ext}` : `${filename}_${j}${ext}`,
          disabled: false,
          isCurrent: i === j
        });
      }
      if (pageCount >= (sizes * 2) + 1) {
        const ell = { title: '...', path: '', disabled: true };
        let ss = 0;
        let se = 0;
        let es = 0;
        let ee = 0;
        if (i < (sizes * 2 + 1)) {
          ss = (sizes * 2 + 1) + 2 - 1;
          se = pageCount - ss - 1;
          center.splice(ss, se, ell);
        } else if (i > pageCount - sizes * 2) {
          es = 1;
          ee = pageCount - 2 - (sizes * 2 + 1);
          center.splice(es, ee, ell);
        } else {
          ss = 1;
          se = i - sizes - ss - 1;
          center.splice(ss, se, ell);
          es = i + sizes;
          ee = pageCount - es - 1;
          center.splice(es - (se - 1), ee, ell);
        }
      }
      item = item.concat(center);
      item.push(next);

      pages.push(item);
    }
    return pages;
  }

  // 根据path查找所有的文档
  findNormalListByPath (filepath: string): SearchListItem[] {
    const res = this.normalList.filter(item => {
      return item.path.indexOf(filepath) === 0;
    });
    // 排序
    res.sort((a, b) => {
      let _res = a.order - b.order;
      if (_res === 0) {
        _res = new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
      }
      return _res;
    });
    return res;
  }

}

export default BaseModel;
