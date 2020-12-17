import path from 'path';
import dayjs from 'dayjs';
import MarkdownToHtml from './MarkdownToHtml';
import Tree from './Tree';
import {
  ModelTypes,
  AssetsItem,
  MarkdownParseAttribute,
  TagsItem,
  getProperty,
  PageItem,
  TempTextLink,
  TempImageLink,
  TempListItem,
  TempTreeItem
} from './Interfaces';

class BaseModel {
  $t: Tree;
  $m: MarkdownToHtml;
  g = {
    $path: '',
    $hosts: ''
  };

  topNav: TempTextLink[] = [];
  normalTree: TempTreeItem[] = [];
  collectionRecommend: TempImageLink[] = [];
  normalRecommend: TempTextLink[] = [];
  tagsList: TagsItem[] = [];
  collectionBooks: MarkdownParseAttribute[][] = [];

  constructor (tree: Tree, markdownToHtml: MarkdownToHtml) {
    this.$t = tree;
    this.$m = markdownToHtml;
    this.g = {
      $path: path.resolve(__dirname, `../../${this.$m.config.templateConfig.root}`),
      $hosts: this.$m.config.siteConfig.hosts
    };
    this.generateTopNav();
    this.getNormalTree();
    this.generateTags();
    this.generateNormalRecommend();
    this.generateCollectionGroup();
    this.generateCollectionRecommend();
  }

  // 获取dayjs对象
  getDayjs (d: string | number): dayjs.Dayjs {
    return dayjs(d);
  }

  // 格式化时间
  formatDatetime (t: number): string {
    return dayjs(t).format('YYYY-MM-DD HH:mm');
  }

  // 格式keywords
  formatKeywords (keywords: string[]): { title: string, path: string}[] {
    const res: { title: string, path: string}[] = [];
    keywords.forEach(keyword => {
      res.push({
        title: keyword,
        path: this.mergerHosts(`tags/${this.$m.pinYin(keyword)}.html`)
      });
    });
    return res;
  }

  // 格式化列表数据
  formatTempListItem (data: MarkdownParseAttribute[]): TempListItem[] {
    const res: TempListItem[] = [];
    data.forEach(item => {
      const parentInfo = this.$t.find(item.pid);
      res.push({
        title: item.title,
        path: this.mergerHosts(this.replaceFileExt(item.path)),
        desc: item.desc || '',
        parent: {
          title: parentInfo?.title || '',
          path: this.mergerHosts(this.replaceFileExt(parentInfo?.path || ''))
        },
        publishDate: this.formatDatetime(item.publishDate),
        keywords: this.formatKeywords(item?.keywords || []),
        cover: item.cover || ''
      });
    });
    return res;
  }

  // 将md后缀替换成html
  replaceFileExt (filepath: string): string {
    const listDoc = this.$m.config.docConfig.listDoc;
    const o = path.parse(filepath);
    o.ext = '.html';
    if (o.base === listDoc) {
      o.name = 'index';
    }
    return `${o.dir ? o.dir + '/' : ''}${o.name}${o.ext}`;
  }

  // 查找当前顶级目录
  findIndexTopNav (str: string): number {
    const index = this.topNav.findIndex(item => this.mergerHosts(str).indexOf(item.path) === 0);
    return index > -1 ? index : 0;
  }

  // 面包屑
  getBreadcrumb (paths: string[]): TempTextLink[] {
    const _paths = [ ... paths];
    const res: TempTextLink[] = [];
    _paths.reduce((prev: string[], current) => {
      prev.push(current);
      const item = this.$t.find(prev.join('/'));
      if (item) {
        res.push({
          path: this.mergerHosts(this.replaceFileExt(item.path)),
          title: item.title || ''
        });
      }
      return prev;
    }, []);
    return res;
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

  // 拼接网站地址
  mergerHosts (path: string): string {
    return `${this.$m.config.siteConfig.hosts}${path}`;
  }

  // 拼接模板地址
  mergeTemplatePath (template: string): string {
    return path.join(this.g.$path, template);
  }

  // 拼接网站标题
  mergeSiteTitle (title: string): string {
    const siteName = this.$m.config.siteConfig.siteName;
    return title ? `${title} - ${siteName}` : siteName;
  }

  // 拼接assets
  mergeAssets (template: string): AssetsItem {
    const assets: AssetsItem = JSON.parse(JSON.stringify(this.$m.config.templateConfigData[template]));
    assets.styles.forEach((item, index) => {
      item = `assets/${item}`;
      assets.styles[index] = this.mergerHosts(item);
    });
    assets.scripts.forEach((item, index) => {
      item = `assets/${item}`;
      assets.scripts[index] = this.mergerHosts(item);
    });
    return assets;
  }

  // 获取topNav
  generateTopNav (): void {
    const d = this.$t.directoryList.filter(item => item.pid === '' && item.mode !== ModelTypes.Normal);
    const s = [...this.$t.singleList];
    const topNav = d.concat(s);
    topNav.sort((a, b) => {
      return a.order - b.order;
    });
    topNav.forEach(item => {
      this.topNav.push({
        title: item.title,
        path: this.mergerHosts(this.replaceFileExt(item.path)),
        icon: item.icon
      });
    });
  }

  // 获取普通文档目录树
  getNormalTree (): void {
    const res: TempTreeItem[] = [];
    const normalTree = this.$t.directoryListTree.filter(item => item.mode === ModelTypes.Normal);
    // 排序
    normalTree.sort((a, b) => {
      return this.$t.sorts(a, b);
    });
    // 组织模板格式
    const findChildren = (data: MarkdownParseAttribute[], arr = res) => {
      data.forEach(item => {
        const _item = {
          title: item.title,
          path: this.mergerHosts(this.replaceFileExt(item.path)),
          icon: item.icon,
          children: []
        };
        if (item.children && item.children.length > 0) {
          findChildren(item.children, _item.children);
        }
        arr.push(_item);
      });
    };
    findChildren(normalTree);
    this.normalTree = res;
  }

  // 检查目录是否是最后的文集目录
  checkIsLastCollection (id: string): boolean {
    const data = this.collectionBooks.filter(item => item[0].id === id);
    return data.length > 0;
  }

  // 所有的tags
  generateTags (): void {
    interface TOB {
      [index: string]: TagsItem
    }
    const tags: TOB = {};
    this.$t.normalList.forEach(item => {
      const keywords: string [] = item.keywords || [];
      keywords.forEach(keyword => {
        const key = this.$m.pinYin(keyword);
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
    });
    this.$t.collectionList.forEach(item => {
      const keywords: string [] = item.keywords || [];
      keywords.forEach(keyword => {
        const key = this.$m.pinYin(keyword);
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
    });
    Object.keys(tags).forEach(tag => {
      this.tagsList.push(tags[tag]);
    });
    // 排序
    this.tagsList.sort((a, b) => {
      return b.count - a.count;
    });
  }

  // 获取普通推荐文档
  generateNormalRecommend (): void {
    const res = this.$t.normalList.filter(item => item.recommend === 2);
    const list: TempTextLink[] = [];
    res.forEach(item => {
      list.push({
        title: item.title,
        path: this.mergerHosts(this.replaceFileExt(item.path))
      });
    });
    this.normalRecommend = list;
  }

  // 获取推荐文集
  generateCollectionGroup(): void {
    interface TOB {
      [index: string]: {
        group: string,
        list: MarkdownParseAttribute[]
      }
    }
    const books: TOB = {};
    this.$t.collectionList.forEach(item => {
      const pitem = getProperty<TOB, string>(books, item.pid);
      if (pitem) {
        pitem.list.push(item);
      } else {
        books[item.pid] = {
          group: item.pid,
          list: [item]
        };
      }
    });
    Object.keys(books).forEach(key => {
      const item = getProperty(books, key);
      const indexInfo = this.$t.find(item.group);
      if (indexInfo) {
        const a = [indexInfo].concat(item.list);
        this.collectionBooks.push(a);
      }
    });
  }

  // 获取推荐文集
  generateCollectionRecommend(): void {
    const res = this.collectionBooks.filter(item => item[0].recommend === 1);
    res.forEach(item => {
      const cover = item[0];
      const _path = this.mergerHosts(this.replaceFileExt(cover.path));
      this.collectionRecommend.push({
        title: cover.title,
        path: _path,
        cover: cover.cover || ''
      });
    });
  }
}

export default BaseModel;
