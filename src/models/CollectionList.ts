import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import { ModelTypes, AddFileItem, PageItem, CollectionListItem, TopNavItem } from '../lib/Interfaces';

class CollectionList {
  mode = ModelTypes.Collection;
  template = 'collection.html';
  coverTemplate = 'collection_detail.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }
  creatPages (listPath: string): AddFileItem[] {
    const _listPath = listPath.replace('/' + this.baseModel.tree.listDoc, '');
    const info = this.baseModel.collectionList.find(item => item.id === _listPath);
    const res: AddFileItem[] = [];
    if (info) {
      if (info.isLast) {
        res.push({
          path: `${info.id}/index.html`,
          contents: this.renderCover(info)
        });
      } else {
        const filename = `${info.id}/index`;
        const ext = '.html';
        const pageSize = this.baseModel.markdownToHtml.config.templateConfig.pageSize;

        const list = this.baseModel.collectionList.filter(item => item.isLast && item.id.indexOf(_listPath) === 0);
        const pages: PageItem[][] = this.baseModel.listPages(list.length, pageSize, this.baseModel.mergerHosts(filename), ext);
        pages.forEach((item, index) => {
          const _list = list.splice(0, pageSize);
          const _path = index === 0 ? `${filename}${ext}` : `${filename}_${index + 1}${ext}`;
          res.push({
            path: _path,
            contents: this.render(listPath, _list, item)
          });
        });
      }
    }
    return res;
  }
  render (listPath: string, list: CollectionListItem[], pages: PageItem[]): string {
    const modelData = this.baseModel.tree.findByPath(listPath);
    const { styles, scripts} = this.baseModel.mergeAssets(this.template);
    if (modelData) {
      const content = modelData.content;
      const head = {
        title: this.baseModel.mergeSiteTitle(content.title),
        keywords: content.keywords,
        desc: content.desc,
        styles
      };
      const header = {
        current: this.baseModel.findTopIndex(modelData.paths[0]),
        list: this.baseModel.topNav
      };
      const tree = {
        list: this.baseModel.normalTree,
        current: this.baseModel.mergerHosts(modelData.path)
      };
      const breadcrumb = {
        home: this.baseModel.g.$hosts,
        list: this.baseModel.getBreadcrumb(modelData.paths)
      };
      const main = {
        list: list,
        pages: pages
      };
      const footer = {
        copyright: this.baseModel.markdownToHtml.config.siteConfig.copyright,
        hosts: this.baseModel.markdownToHtml.config.siteConfig.hosts,
        beian: this.baseModel.markdownToHtml.config.siteConfig.beian
      };
      const aside = {
        list: this.baseModel.collectionRecommend,
        textList: this.baseModel.normalRecommend,
        tags: this.baseModel.tags.slice(0, 20)
      };
      const foot = {
        scripts
      };
      const templatePath = this.baseModel.mergeTemplatePath(this.template);
      const template = ejs.fileLoader(templatePath).toString();
      const html = ejs.render(template, {
        g: this.baseModel.g,
        head: head,
        header: header,
        tree: tree,
        breadcrumb: breadcrumb,
        main: main,
        footer: footer,
        aside: aside,
        foot: foot
      });
      return html;
    } else {
      throw new Error(`${listPath} 目录配置错误！`);
    }
  }
  findRelated (collectionInfo: CollectionListItem): TopNavItem[] {
    const list = this.baseModel.collectionContents.filter(item => item.parent === collectionInfo.id);
    const res: TopNavItem[] = [];
    const _collectionInfo = Object.assign({}, collectionInfo);
    _collectionInfo.title = `${collectionInfo.title}封面`;
    _collectionInfo.path = `${collectionInfo.path}/index.html`;
    res.push(_collectionInfo);
    list.forEach(item => {
      res.push({
        id: item.path,
        path: this.baseModel.mergerHosts(item.path),
        title: item.content.title,
        order: item.content.order,
        publishDate: item.content.publishDate,
        icon: item.content.icon
      });
    });
    return res;
  }
  renderCover (collectionInfo: CollectionListItem): string {
    const listPath = `${collectionInfo.id}/${this.baseModel.tree.listDoc}`;
    const modelData = this.baseModel.tree.findByPath(listPath);
    const { styles, scripts} = this.baseModel.mergeAssets(this.coverTemplate);
    if (modelData) {
      const content = modelData.content;
      const head = {
        title: this.baseModel.mergeSiteTitle(content.title),
        keywords: content.keywords,
        desc: content.desc,
        styles
      };
      const header = {
        current: this.baseModel.findTopIndex(modelData.paths[0]),
        list: this.baseModel.topNav
      };
      const treeList = this.findRelated(collectionInfo);
      const fullPath = `${collectionInfo.path}/index.html`;
      const tree = {
        list: treeList,
        current: fullPath
      };
      const breadcrumb = {
        home: this.baseModel.g.$hosts,
        list: this.baseModel.getBreadcrumb(modelData.paths)
      };
      const main = {
        title: `${content.title}封面`,
        body: content.body,
        nav: content.navigation,
        related: {
          prev: {},
          next: treeList[1]
        }
      };
      const footer = {
        copyright: this.baseModel.markdownToHtml.config.siteConfig.copyright,
        hosts: this.baseModel.markdownToHtml.config.siteConfig.hosts,
        beian: this.baseModel.markdownToHtml.config.siteConfig.beian
      };
      const aside = {
        list: this.baseModel.collectionRecommend,
        textList: this.baseModel.normalRecommend,
        tags: this.baseModel.tags.slice(0, 20)
      };
      const foot = {
        scripts
      };
      const templatePath = this.baseModel.mergeTemplatePath(this.coverTemplate);
      const template = ejs.fileLoader(templatePath).toString();
      const html = ejs.render(template, {
        g: this.baseModel.g,
        head: head,
        header: header,
        tree: tree,
        breadcrumb: breadcrumb,
        main: main,
        footer: footer,
        aside: aside,
        foot: foot
      });
      return html;
    } else {
      throw new Error(`${collectionInfo.id} 封面配置错误！`);
    }
  }
}

export default CollectionList;
