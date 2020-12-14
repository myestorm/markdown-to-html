import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import { ModelTypes, SearchListItem } from '../lib/Interfaces';

class Home {
  mode = ModelTypes.Home;
  template = 'index.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  // 最新数据
  getNewest (len = 20): SearchListItem[] {
    return this.baseModel.normalList.slice(0, len);
  }

  // 推荐数据 Recommend = 1
  getRecommend (len = 20): SearchListItem[] {
    const arr = this.baseModel.normalList.filter(item => item.recommend === 1);
    return arr.slice(0, len);
  }

  render (): string {
    const modelData = this.baseModel.tree.findByPath(this.baseModel.tree.listDoc);
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
        current: ''
      };
      const main = {
        newest: this.getNewest(),
        recommend: this.getRecommend()
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

export default Home;
