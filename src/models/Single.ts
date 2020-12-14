import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import { ModelTypes } from '../lib/Interfaces';

class Single {
  mode = ModelTypes.Single;
  template = 'about.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
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
        title: content.title,
        body: content.body,
        nav: content.navigation
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

export default Single;
