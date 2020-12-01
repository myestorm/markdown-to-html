import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import { TreeNodeItem, ModelTypes } from '../lib/T';

export default class ArticleModel extends BaseModel {
  type = ModelTypes.Article;
  constructor () {
    super('index.html'); // 设置模板
  }
  render (data: TreeNodeItem): string {

    // 组织模板所需要的数据
    const pageData = {
      ...this.pageData
    };

    const templateConfigData = this.templateConfigData;
    const { styles, scripts } = templateConfigData[this.template];
    const content = data.content;

    pageData.head.title = this.mkPageTitle(content.title);
    pageData.head.keywords = content.keywords.join(',');
    pageData.head.description = content.desc;
    if (styles) {
      pageData.head.styles = styles;
    }
    if (scripts) {
      pageData.body.foot.scripts = scripts;
    }

    // 读取模板
    const templatePath = this.mkTemplatePath();
    const temp = ejs.fileLoader(templatePath).toString();

    // 数据渲染模板
    const html = ejs.render(temp, pageData);
    return html;
  }
}
