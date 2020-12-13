import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import MarkdownToHtml from '../lib/MarkdownToHtml';
import Tree from '../lib/Tree';
import { ModelTypes, AddFileItem, PageItem } from '../lib/Interfaces';

interface CollectionListItem {
  title: string,
  cover: string,
  path: string,
  count: number
}

class CollectionList extends BaseModel {
  mode = ModelTypes.Collection;
  template = 'collection.html';
  constructor (tree: Tree, markdownToHtml: MarkdownToHtml) {
    super(tree, markdownToHtml);
  }
  creatPages (listPath: string): AddFileItem[] {
    const modelData = this.tree.findByPath(listPath);
    const res: AddFileItem[] = [];
    if (modelData) {
      const filename = `${modelData.parent}/index`;
      const ext = '.html';
      const pageSize = this.markdownToHtml.config.templateConfig.pageSize;
      const list: CollectionListItem[] = [];
      this.tree.maps.forEach(item => {
        if (item.isDirectory && item.content.mode === ModelTypes.Collection && item.parent === listPath) {
          list.push({
            title: item.content.title,
            cover: item.content.cover,
            path: this.mergerHosts(item.content.path),
            count: 0
          });
        }
      });
      const pages: PageItem[][] = this.listPages(list.length, pageSize, this.mergerHosts(filename), ext);
      pages.forEach((item, index) => {
        const _list = list.splice(0, pageSize);
        const _path = index === 0 ? `${filename}${ext}` : `${filename}_${index + 1}${ext}`;
        res.push({
          path: _path,
          contents: this.render(listPath, _list, item)
        });
      });
    }
    return res;
  }
  render (listPath: string, list: CollectionListItem[], pages: PageItem[]): string {
    const modelData = this.tree.findByPath(listPath);
    const { styles, scripts} = this.mergeAssets(this.template);
    if (modelData) {
      const content = modelData.content;
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
        current: this.mergerHosts(modelData.path)
      };
      const breadcrumb = {
        home: this.g.$hosts,
        list: this.getBreadcrumb(modelData.paths)
      };
      const main = {
        list: list,
        pages: pages
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
        breadcrumb: breadcrumb,
        main: main,
        footer: footer,
        aside: aside,
        foot: foot
      });
      return html;
    } else {
      throw new Error(`${listPath} 目录配置错误！`);
    }
  }
}

export default CollectionList;
