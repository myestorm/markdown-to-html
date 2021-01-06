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
  PageItem,
  TagsItem
} from '../lib/Interfaces';

class Tags {
  mode = ModelTypes.Tags;
  template = 'tags.html';
  listTemplate = 'tags_list.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  render (id: string): GulpFileItem[] {
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
        list: this.baseModel.tagsList || []
      };
      const footer: TempFooter = {
        copyright: this.baseModel.$m.config.siteConfig.copyright,
        copyrightText: this.baseModel.$m.config.siteConfig.copyrightText,
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
    const res = [{
      path: filepath,
      contents: html
    }];
    const fileList = this.tagsList(id);
    return res.concat(fileList);
  }

  tagsList (id: string): GulpFileItem[] {
    const tags = this.baseModel.tagsList;
    const files: GulpFileItem[] = [];
    tags.forEach(item => {
      const filename = `tags/${this.baseModel.$m.pinYin(item.title)}`;
      const ext = '.html';
      const pageSize = this.baseModel.$m.config.templateConfig.pageSize;
      const listNormal = this.baseModel.$t.normalList.filter(sub => {
        const keywords = sub.keywords || [];
        return keywords.includes(item.title);
      });
      const listCollection = this.baseModel.$t.collectionList.filter(sub => {
        const keywords = sub.keywords || [];
        return keywords.includes(item.title);
      });
      const mergrList = listNormal.concat(listCollection);
      const list = this.baseModel.formatTempListItem(mergrList);
      const pages: PageItem[][] = this.baseModel.listPages(list.length, pageSize, this.baseModel.mergerHosts(filename), ext);
      pages.forEach((sub, index) => {
        const _list = list.splice(0, pageSize);
        const _path = index === 0 ? `${filename}${ext}` : `${filename}_${index + 1}${ext}`;
        files.push({
          path: _path,
          contents: this.renderList(id, _list, item, sub)
        });
      });
    });
    return files;
  }

  renderList (id: string, list: TempListItem[], data: TagsItem, pages: PageItem[]): string {
    const { styles, scripts} = this.baseModel.mergeAssets(this.listTemplate);
    const modelData = this.baseModel.$t.find(id);
    let html = '';
    if (modelData) {
      const pageTitle = `与${data.title}相关的内容`;
      const filepath = this.baseModel.replaceFileExt(modelData.path);
      const head: TempHead = {
        title: this.baseModel.mergeSiteTitle(pageTitle),
        keywords: data.title,
        desc: `${pageTitle}。`,
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
      const breadcrumbList = this.baseModel.getBreadcrumb(modelData.paths);
      breadcrumbList.push({
        title: pageTitle,
        path: ''
      });
      const breadcrumb: TempBreadcrumb = {
        home: this.baseModel.g.$hosts,
        list: breadcrumbList
      };
      const main = {
        list: list,
        pages: pages
      };
      const footer: TempFooter = {
        copyright: this.baseModel.$m.config.siteConfig.copyright,
        copyrightText: this.baseModel.$m.config.siteConfig.copyrightText,
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
      const templatePath = this.baseModel.mergeTemplatePath(this.listTemplate);
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
    return html;
  }
}

export default Tags;
