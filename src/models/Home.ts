import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import MarkdownToHtml from '../lib/MarkdownToHtml';
import Tree from '../lib/Tree';
import { ModelTypes, SearchListItem } from '../lib/Interfaces';

class Home extends BaseModel {
  mode = ModelTypes.Home;
  template = 'index.html';
  constructor (tree: Tree, markdownToHtml: MarkdownToHtml) {
    super(tree, markdownToHtml);
  }

  // 最新数据
  getNewest (len = 20): SearchListItem[] {
    return this.normalList.slice(0, len);
  }

  // 推荐数据 Recommend = 1
  getRecommend (len = 20): SearchListItem[] {
    const arr = this.normalList.filter(item => item.recommend === 1);
    return arr.slice(0, len);
  }

  render (): string {
    const indexData = this.tree.findByPath(this.tree.listDoc);
    const { styles, scripts} = this.mergeAssets(this.template);
    if (indexData) {
      const content = indexData.content;
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
        current: ''
      };
      const main = {
        newest: this.getNewest(),
        recommend: this.getRecommend()
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
