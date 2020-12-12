import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import MarkdownToHtml from '../lib/MarkdownToHtml';
import Tree from '../lib/Tree';
import { ModelTypes } from '../lib/Interfaces';

class Home extends BaseModel {
  mode = ModelTypes.Home;
  template = 'index.html';
  constructor (tree: Tree, markdownToHtml: MarkdownToHtml) {
    super(tree, markdownToHtml);
  }
  render (): string {
    // 获取首页数据
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
      const templatePath = this.mergeTemplatePath(this.template);
      const template = ejs.fileLoader(templatePath).toString();
      const html = ejs.render(template, {
        g: this.g,
        head: head
      });
      return html;
    } else {
      throw new Error('首页配置不存在');
    }
  }
}

export default Home;
