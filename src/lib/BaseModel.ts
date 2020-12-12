import path from 'path';
import dayjs from 'dayjs';
import MarkdownToHtml from './MarkdownToHtml';
import Tree from './Tree';
import { ModelTypes, TreeNodeItem, getProperty, AssetsItem } from './Interfaces';

export interface TopNavItem {
  path: string,
  title: string,
  icon: string,
  children?: TopNavItem[]
}

export interface SearchListItem {
  path: string,
  parent: string,
  parentName: string,
  title: string,
  keywords: string,
  desc: string,
  publishDate: string
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

class BaseModel {
  markdownToHtml: MarkdownToHtml;
  tree: Tree;
  topNav: TopNavItem[] = [];
  normalTree: TopNavItem[] = [];
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
    // console.log(JSON.stringify(this.tags, null, 4));
  }

  // 格式化时间
  formatDatetime (t: number): string {
    return dayjs(t).format('YYYY-MM-DD HH:mm');
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
    assets.styles.forEach((item, index) => {
      assets.styles[index] = this.mergerHosts(item);
    });
    assets.scripts.forEach((item, index) => {
      assets.scripts[index] = this.mergerHosts(item);
    });
    return assets;
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
    const reg = new RegExp(this.tree.listDoc, 'gim');
    for (const [key, value] of this.tree.maps.entries()) {
      if (!value.isDirectory && !reg.test(value.path)) {
        let parentName = '';
        const parentItem = this.tree.findByPath(value.parent);
        if (parentItem) {
          const content = this.tree.getContent(parentItem);
          if (content?.title) {
            parentName = content.title;
          }
        }

        this.searchList.push({
          path: this.mergerHosts(key),
          parent: this.mergerHosts(value.parent),
          parentName,
          title: value.content.title,
          keywords: value.content.keywords.join(', '),
          desc: value.content.desc,
          publishDate: this.formatDatetime(value.content.publishDate)
        });
      }
    }
  }

  // 右侧文集推荐 Collection list && Recommend = 1
  generateCollectionRecommend (): void {
    const reg = new RegExp(this.tree.listDoc, 'gim');
    this.tree.maps.forEach(value => {
      if (!value.isDirectory && reg.test(value.path) && value.content.mode === ModelTypes.Collection && value.content.recommend === 1) {
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
    const reg = new RegExp(this.tree.listDoc, 'gim');
    this.tree.maps.forEach(value => {
      if (!value.isDirectory && !reg.test(value.path) && value.content.mode === ModelTypes.Normal && value.content.recommend === 2) {
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
    const reg = new RegExp(this.tree.listDoc, 'gim');
    const tags: TOB = {};
    this.tree.maps.forEach(value => {
      if (!value.isDirectory && !reg.test(value.path)) {
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

}

export default BaseModel;
