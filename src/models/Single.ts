import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import {
  ModelTypes,
  TempHead,
  TempHeader,
  TempTree,
  TempBreadcrumb,
  TempFooter,
  TempAside,
  TempFoot,
  GulpFileItem
} from '../lib/Interfaces';

class Home {
  mode = ModelTypes.Single;
  template = 'about.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  render (id: string): GulpFileItem {
    let filepath = '';
    let html = '';
    const modelData = this.baseModel.$t.find(id);
    const { styles, scripts} = this.baseModel.mergeAssets(this.template);
    if (modelData) {
      filepath = this.baseModel.replaceFileExt(modelData.path);
      const head: TempHead = {
        title: this.baseModel.mergeSiteTitle(modelData.title),
        keywords: modelData.keywords ? modelData.keywords.join(', ') : '',
        desc: modelData.desc || '',
        styles
      };
      const header: TempHeader = {
        logo: this.baseModel.$logo,
        current: this.baseModel.findIndexTopNav(filepath),
        list: this.baseModel.topNav
      };
      const tree: TempTree = {
        list: this.baseModel.normalTree,
        current: ''
      };
      const breadcrumb: TempBreadcrumb = {
        home: this.baseModel.g.$hosts,
        list: this.baseModel.getBreadcrumb(modelData.paths)
      };
      const main = {
        title: modelData.title,
        body: modelData.body,
        nav: modelData.navigation
      };
      const footer: TempFooter = {
        copyright: this.baseModel.$m.config.siteConfig.copyright,
        hosts: this.baseModel.$m.config.siteConfig.hosts,
        beian: this.baseModel.$m.config.siteConfig.beian || ''
      };
      const aside: TempAside = {
        list: this.baseModel.collectionRecommend,
        textList: this.baseModel.normalRecommend,
        tags: this.baseModel.tagsList.slice(0, 20)
      };
      const foot: TempFoot = {
        scripts
      };
      const templatePath = this.baseModel.mergeTemplatePath(this.template);
      const template = ejs.fileLoader(templatePath).toString();
      html = ejs.render(template, {
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
    }
    return {
      path: filepath,
      contents: html
    };
  }
}

export default Home;
