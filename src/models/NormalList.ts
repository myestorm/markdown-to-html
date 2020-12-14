import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import { ModelTypes, AddFileItem, PageItem, SearchListItem } from '../lib/Interfaces';

class NormalList {
  mode = ModelTypes.Normal;
  template = 'list.html';
  baseModel: BaseModel;
  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  creatPages (listPath: string): AddFileItem[] {
    const modelData = this.baseModel.tree.findByPath(listPath);
    const res: AddFileItem[] = [];
    if (modelData) {
      const filename = `${modelData.parent}/index`;
      const ext = '.html';
      const pageSize = this.baseModel.markdownToHtml.config.templateConfig.pageSize;
      // const pageSize = 1;
      const list = this.baseModel.findNormalListByPath(this.baseModel.mergerHosts(modelData.parent));
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
    return res;
  }
  render (listPath: string, list: SearchListItem[], pages: PageItem[]): string {
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
}

export default NormalList;
