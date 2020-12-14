import ejs from 'ejs';
import path from 'path';
import BaseModel from '../lib/BaseModel';
import { ModelTypes, PageItem, SearchListItem, TagsItem, AddFileItem } from '../lib/Interfaces';

class Tags {
  mode = ModelTypes.Tags;
  template = 'tags.html';
  listTemplate = 'tags_list.html';
  baseModel: BaseModel;

  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }

  render (filepath: string): string {
    const modelData = this.baseModel.tree.findByPath(filepath);
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
        current: this.baseModel.findTopIndex(modelData.paths[0]),
        list: this.baseModel.topNav
      };
      const tree = {
        list: this.baseModel.normalTree,
        current: ''
      };
      const breadcrumb = {
        home: this.baseModel.g.$hosts,
        list: this.baseModel.getBreadcrumb(modelData.paths)
      };
      const main = {
        list: this.baseModel.tags || []
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
        breadcrumb: breadcrumb,
        main: main,
        footer: footer,
        aside: aside,
        foot: foot
      });
      return html;
    } else {
      throw new Error('标签配置文件不正确');
    }
  }

  tagsList (filepath: string): AddFileItem[] {
    const tags = this.baseModel.tags;
    const files: AddFileItem[] = [];
    tags.forEach(item => {
      const paths = path.parse(item.path);
      const filename = `${paths.dir}/${paths.name}`;
      const ext = paths.ext;
      const pageSize = this.baseModel.markdownToHtml.config.templateConfig.pageSize;
      const list = this.baseModel.searchList.filter(sub => {
        return sub.keywords.indexOf(item.title) > -1;
      });
      const pages: PageItem[][] = this.baseModel.listPages(list.length, pageSize, filename, ext);
      pages.forEach((sub, index) => {
        const _list = list.splice(0, pageSize);
        const _path = index === 0 ? `tags/${paths.name}${ext}` : `tags/${paths.name}_${index + 1}${ext}`;
        files.push({
          path: _path,
          contents: this.renderList(filepath, _list, item, sub)
        });
      });
    });
    return files;
  }

  renderList (filepath: string, list: SearchListItem[], data: TagsItem, pages: PageItem[]): string {
    const modelData = this.baseModel.tree.findByPath(filepath);
    const { styles, scripts} = this.baseModel.mergeAssets(this.listTemplate);
    if (modelData) {
      const pageTitle = `与${data.title}相关的内容`;
      const head = {
        title: this.baseModel.mergeSiteTitle(pageTitle),
        keywords: data.title,
        desc: `${pageTitle}。`,
        styles
      };
      const header = {
        current: this.baseModel.findTopIndex(modelData.paths[0]),
        list: this.baseModel.topNav
      };
      const tree = {
        list: this.baseModel.normalTree,
        current: ''
      };
      const breadcrumbList = this.baseModel.getBreadcrumb(modelData.paths);
      breadcrumbList.push({
        title: pageTitle,
        path: ''
      });
      const breadcrumb = {
        home: this.baseModel.g.$hosts,
        list: breadcrumbList
      };
      const main = {
        list: list,
        pages: pages
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
        breadcrumb: breadcrumb,
        main: main,
        footer: footer,
        aside: aside,
        foot: foot
      });
      return html;
    } else {
      throw new Error('标签配置文件不正确');
    }
  }
}

export default Tags;
