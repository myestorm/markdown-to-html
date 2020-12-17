import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import {
  ModelTypes,
  TempListItem,
  TempHead,
  TempHeader,
  TempTree,
  TempFooter,
  TempAside,
  TempFoot,
  GulpFileItem
} from '../lib/Interfaces';

class Home {
  mode = ModelTypes.Home;
  template = 'index.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  // 最新数据
  getNewest (len = 20): TempListItem[] {
    const res = this.baseModel.$t.normalList.slice(0, len);
    return this.baseModel.formatTempListItem(res);
  }

  // 推荐数据 Recommend = 1
  getRecommend (len = 20): TempListItem[] {
    const arr = this.baseModel.$t.normalList.filter(item => item.recommend === 1);
    return this.baseModel.formatTempListItem(arr.slice(0, len));
  }

  render (): GulpFileItem {
    const filepath = 'index.html';
    let html = '';
    const modelData = this.baseModel.$t.find('index');
    const { styles, scripts} = this.baseModel.mergeAssets(this.template);
    if (modelData) {
      const head: TempHead = {
        title: this.baseModel.mergeSiteTitle(modelData.title),
        keywords: modelData.keywords ? modelData.keywords.join(', ') : '',
        desc: modelData.desc || '',
        styles
      };
      const header: TempHeader = {
        current: 0,
        list: this.baseModel.topNav
      };
      const tree: TempTree = {
        list: this.baseModel.normalTree,
        current: ''
      };
      const main = {
        newest: this.getNewest(),
        recommend: this.getRecommend()
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
