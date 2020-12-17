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
  GulpFileItem,
  TempTextLink,
  TempListItem,
  PageItem,
  MarkdownParseAttribute
} from '../lib/Interfaces';

class Normal {
  mode = ModelTypes.Normal;
  template = 'detail.html';
  templateList = 'list.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  findRelated (id: string): { prev: TempTextLink, next: TempTextLink } {
    const normalList = this.baseModel.$t.normalList;
    const _index = normalList.findIndex(item => item.id === id);
    const _prev = normalList[_index - 1];
    const _next = normalList[_index + 1];
    const prev: TempTextLink = {
      title: _prev ? _prev.title : '',
      path: _prev ? this.baseModel.mergerHosts(this.baseModel.replaceFileExt(_prev.title)) : '',
    };
    const next: TempTextLink = {
      title: _next ? _next.title : '',
      path: _next ? this.baseModel.mergerHosts(this.baseModel.replaceFileExt(_next.title)) : '',
    };
    return {
      prev,
      next
    };
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
      const info = this.baseModel.formatTempListItem([modelData]);
      const main = {
        title: modelData.title,
        body: modelData.body,
        nav: modelData.navigation,
        related: this.findRelated(id),
        info: info[0]
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

  getPageList (id: string): GulpFileItem[] {
    const modelData = this.baseModel.$t.find(id);
    const res: GulpFileItem[] = [];
    if (modelData) {
      const filename = this.baseModel.replaceFileExt(modelData.path).replace(/\.html$/, '');
      const ext = '.html';
      const pageSize = this.baseModel.$m.config.templateConfig.pageSize;
      const nList = this.baseModel.$t.normalList.filter(item => item.id.indexOf(id) === 0);
      const list = this.baseModel.formatTempListItem(nList);
      const pages: PageItem[][] = this.baseModel.listPages(list.length, pageSize, this.baseModel.mergerHosts(filename), ext);
      pages.forEach((item, index) => {
        const _list = list.splice(0, pageSize);
        const _path = index === 0 ? `${filename}${ext}` : `${filename}_${index + 1}${ext}`;
        res.push(this.renderList(modelData, _path, _list, item));
      });
    }
    return res;
  }

  renderList (modelData: MarkdownParseAttribute, filepath: string, list: TempListItem[], pages: PageItem[]): GulpFileItem {
    let html = '';
    const { styles, scripts} = this.baseModel.mergeAssets(this.templateList);
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
        current: this.baseModel.mergerHosts(this.baseModel.replaceFileExt(modelData.path))
      };
      const breadcrumb: TempBreadcrumb = {
        home: this.baseModel.g.$hosts,
        list: this.baseModel.getBreadcrumb(modelData.paths)
      };
      const main = {
        list: list,
        pages: pages
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
      const templatePath = this.baseModel.mergeTemplatePath(this.templateList);
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

export default Normal;
