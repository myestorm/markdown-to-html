import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import {
  ModelTypes,
  TempListItem,
  TempHead,
  TempHeader,
  TempTree,
  TempBreadcrumb,
  TempFooter,
  TempAside,
  TempFoot,
  GulpFileItem,
  MarkdownParseAttribute
} from '../lib/Interfaces';

class Search {
  mode = ModelTypes.Search;
  template = 'search.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  // 最新数据
  getSeachData (): TempListItem[] {
    let res: MarkdownParseAttribute[] = [];
    const normalList = this.baseModel.$t.normalList.filter(item => item.id);
    const collectionList = this.baseModel.$t.collectionList.filter(item => item.id);
    res = normalList.concat(collectionList);
    return this.baseModel.formatTempListItem(res);
  }

  render (): GulpFileItem {
    const filepath = 'search.html';
    let html = '';
    const { styles, scripts} = this.baseModel.mergeAssets(this.template);
    const head: TempHead = {
      title: this.baseModel.mergeSiteTitle('搜索'),
      keywords: '',
      desc: '内容搜素',
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
    const breadcrumb: TempBreadcrumb = {
      home: this.baseModel.g.$hosts,
      list: [{ title: '搜索结果', path: '' }]
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
      footer: footer,
      aside: aside,
      foot: foot
    });
    return {
      path: filepath,
      contents: html
    };
  }
}

export default Search;
