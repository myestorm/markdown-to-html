import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import MarkdownToHtml from '../lib/MarkdownToHtml';
import Tree from '../lib/Tree';
import { ModelTypes, SearchListItem } from '../lib/Interfaces';

class Normal extends BaseModel {
  mode = ModelTypes.Normal;
  template = 'detail.html';
  constructor (tree: Tree, markdownToHtml: MarkdownToHtml) {
    super(tree, markdownToHtml);
  }
  findRelated (filepath: string): { prev: SearchListItem, next: SearchListItem } {
    let prev: SearchListItem, next: SearchListItem;
    const _item = this.searchList.findIndex(item => item.path === filepath);
    if (_item > -1) {
      let prevIndex = _item - 1;
      let nextIndex = _item + 1;
      prevIndex = prevIndex < 0 ? this.searchList.length - 1 : prevIndex;
      nextIndex = nextIndex >= this.searchList.length ? 1 : nextIndex;
      prev = this.searchList[prevIndex];
      next = this.searchList[nextIndex];
    } else {
      prev = this.searchList[0];
      next = this.searchList[1];
    }
    return {
      prev,
      next
    };
  }
  render (filepath: string): string {
    const modelData = this.tree.findByPath(filepath);
    const { styles, scripts} = this.mergeAssets(this.template);
    if (modelData) {
      const content = modelData.content;
      const head = {
        title: this.mergeSiteTitle(content.title),
        keywords: content.keywords,
        desc: content.desc,
        styles
      };
      const header = {
        current: 0,
        list: this.topNav
      };
      const tree = {
        list: this.normalTree,
        current: this.mergerHosts(modelData.path)
      };
      const breadcrumb = {
        home: this.g.$hosts,
        list: this.getBreadcrumb(modelData.paths)
      };
      const main = {
        title: content.title,
        body: content.body,
        nav: content.navigation,
        related: this.findRelated(this.mergerHosts(modelData.path)),
        info: this.searchList.find(sub => sub.path === this.mergerHosts(modelData.path))
      };
      const footer = {
        copyright: this.markdownToHtml.config.siteConfig.copyright,
        hosts: this.markdownToHtml.config.siteConfig.hosts,
        beian: this.markdownToHtml.config.siteConfig.beian
      };
      const aside = {
        list: this.collectionRecommend,
        textList: this.normalRecommend,
        tags: this.tags.slice(0, 20)
      };
      const foot = {
        scripts
      };
      const templatePath = this.mergeTemplatePath(this.template);
      const template = ejs.fileLoader(templatePath).toString();
      const html = ejs.render(template, {
        g: this.g,
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
      throw new Error('首页配置文件不存在');
    }
  }
}

export default Normal;
