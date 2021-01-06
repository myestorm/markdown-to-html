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
  PageItem,
  TempTextLink,
  TempImageLink,
  MarkdownParseAttribute
} from '../lib/Interfaces';

class Home {
  mode = ModelTypes.Collection;
  template = 'collection.html';
  templateDetail = 'collection_detail.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  getPageList (id: string): GulpFileItem[] {
    const files: GulpFileItem[] = [];
    const modelData = this.baseModel.$t.find(id);
    if (modelData && this.baseModel.checkIsLastCollection(id) === false) {
      const filename = this.baseModel.replaceFileExt(modelData.path).replace(/\.html$/, '');
      const ext = '.html';
      const list: TempImageLink[] = [];
      this.baseModel.collectionBooks.forEach(item => {
        if (item[0].id.indexOf(id) === 0) {
          list.push({
            title: item[0].title,
            path: this.baseModel.mergerHosts(this.baseModel.replaceFileExt(item[0].path)),
            cover: item[0].cover || '',
            count: item.length
          });
        }
      });
      const pageSize = this.baseModel.$m.config.templateConfig.pageSize;
      const pages: PageItem[][] = this.baseModel.listPages(list.length, pageSize, this.baseModel.mergerHosts(filename), ext);
      pages.forEach((item, index) => {
        const _list = list.splice(0, pageSize);
        const _path = index === 0 ? `${filename}${ext}` : `${filename}_${index + 1}${ext}`;
        files.push(this.render(id, _path, _list, item));
      });
    }
    return files;
  }

  getBooks (): GulpFileItem[] {
    const files: GulpFileItem[] = [];
    this.baseModel.collectionBooks.forEach(item => {
      const treeList: TempTextLink[] = [];
      item.forEach(sub => {
        const isCover = /index\.html$/.test(this.baseModel.replaceFileExt(sub.path));
        treeList.push({
          title: sub.title + (isCover ? '封面' : ''),
          path: this.baseModel.mergerHosts(this.baseModel.replaceFileExt(sub.path)),
          icon: ''
        });
      });
      item.forEach((sub, index) => {
        files.push(this.renderDetail(sub, treeList, item[index - 1], item[index + 1]));
      });
    });
    return files;
  }

  renderDetail (modelData: MarkdownParseAttribute, treeList: TempTextLink[], prev?: MarkdownParseAttribute, next?: MarkdownParseAttribute): GulpFileItem {
    let filepath = '';
    let html = '';
    const { styles, scripts} = this.baseModel.mergeAssets(this.templateDetail);
    const topId = `${modelData.paths[0]}/index.html`;
    filepath = this.baseModel.replaceFileExt(modelData.path);

    const head: TempHead = {
      title: this.baseModel.mergeSiteTitle(modelData.title),
      keywords: modelData.keywords ? modelData.keywords.join(', ') : '',
      desc: modelData.desc || '',
      styles
    };
    const header: TempHeader = {
      logo: this.baseModel.$logo,
      current: this.baseModel.findIndexTopNav(topId),
      list: this.baseModel.topNav
    };
    const tree: TempTree = {
      list: treeList,
      current: this.baseModel.mergerHosts(this.baseModel.replaceFileExt(modelData.path)),
      level: 1
    };
    const breadcrumb: TempBreadcrumb = {
      home: this.baseModel.g.$hosts,
      list: this.baseModel.getBreadcrumb(modelData.paths)
    };
    const isCover = /index\.html$/.test(filepath);
    const main = {
      title: modelData.title + (isCover ? '封面' : ''),
      body: modelData.body,
      nav: modelData.navigation,
      related: {
        prev: prev ? { title: prev.title, path: this.baseModel.mergerHosts(this.baseModel.replaceFileExt(prev.path)) } : {},
        next: next ? { title: next.title, path: this.baseModel.mergerHosts(this.baseModel.replaceFileExt(next.path)) } : {},
      }
    };
    const footer: TempFooter = {
      copyright: this.baseModel.$m.config.siteConfig.copyright,
      copyrightText: this.baseModel.$m.config.siteConfig.copyrightText,
      hosts: this.baseModel.$m.config.siteConfig.hosts,
      beian: this.baseModel.$m.config.siteConfig.beian || ''
    };
    const foot: TempFoot = {
      scripts
    };
    const templatePath = this.baseModel.mergeTemplatePath(this.templateDetail);
    const template = ejs.fileLoader(templatePath).toString();
    html = ejs.render(template, {
      g: this.baseModel.g,
      head: head,
      header: header,
      tree: tree,
      breadcrumb: breadcrumb,
      main: main,
      footer: footer,
      foot: foot
    });
    return {
      path: filepath,
      contents: html
    };
  }

  render (id: string, _path: string, list: TempImageLink[], pages: PageItem[]): GulpFileItem {
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
      path: _path,
      contents: html
    };
  }

}

export default Home;
