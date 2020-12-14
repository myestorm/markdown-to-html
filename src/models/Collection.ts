import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import { ModelTypes, TopNavItem } from '../lib/Interfaces';

class Collection {
  mode = ModelTypes.Collection;
  template = 'collection_detail.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }
  findRelated (parentPath: string): TopNavItem[] {
    const collectionInfo = this.baseModel.collectionList.find(item => item.isLast && item.id === parentPath);
    const res: TopNavItem[] = [];
    if (collectionInfo) {
      const _collectionInfo = Object.assign({}, collectionInfo);
      _collectionInfo.title = `${collectionInfo.title}封面`;
      _collectionInfo.path = `${collectionInfo.path}/index.html`;
      res.push(_collectionInfo);
      const list = this.baseModel.collectionContents.filter(item => item.parent === collectionInfo.id);
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
    }
    return res;
  }
  render (listPath: string): string {
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
        current: 1,
        list: this.baseModel.topNav
      };
      const treeList = this.findRelated(modelData.parent);
      const tree = {
        list: treeList,
        current: this.baseModel.mergerHosts(modelData.path)
      };
      const breadcrumb = {
        home: this.baseModel.g.$hosts,
        list: this.baseModel.getBreadcrumb(modelData.paths)
      };
      const index = treeList.findIndex(item => item.id === modelData.path);
      const main = {
        title: content.title,
        body: content.body,
        nav: content.navigation,
        related: {
          prev: index <= 0 ? {} : treeList[index - 1],
          next: index >= treeList.length - 1 ? {} : treeList[index + 1]
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
      throw new Error(`${listPath} 封面配置错误！`);
    }
  }
}

export default Collection;
