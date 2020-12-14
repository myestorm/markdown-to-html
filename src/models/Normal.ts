import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import { ModelTypes, SearchListItem } from '../lib/Interfaces';

class Normal {
  mode = ModelTypes.Normal;
  template = 'detail.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }
  findRelated (filepath: string): { prev: SearchListItem, next: SearchListItem } {
    let prev: SearchListItem, next: SearchListItem;
    const _item = this.baseModel.searchList.findIndex(item => item.path === filepath);
    if (_item > -1) {
      let prevIndex = _item - 1;
      let nextIndex = _item + 1;
      prevIndex = prevIndex < 0 ? this.baseModel.searchList.length - 1 : prevIndex;
      nextIndex = nextIndex >= this.baseModel.searchList.length ? 1 : nextIndex;
      prev = this.baseModel.searchList[prevIndex];
      next = this.baseModel.searchList[nextIndex];
    } else {
      prev = this.baseModel.searchList[0];
      next = this.baseModel.searchList[1];
    }
    return {
      prev,
      next
    };
  }
  render (filepath: string): string {
    const modelData = this.baseModel.tree.findByPath(filepath);
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
        current: 0,
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
        title: content.title,
        body: content.body,
        nav: content.navigation,
        related: this.findRelated(this.baseModel.mergerHosts(modelData.path)),
        info: this.baseModel.searchList.find(sub => sub.path === this.baseModel.mergerHosts(modelData.path))
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
      throw new Error(`${filepath} 文件错误！`);
    }
  }
}

export default Normal;
