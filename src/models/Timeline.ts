import ejs from 'ejs';
import BaseModel from '../lib/BaseModel';
import { ModelTypes, TimelineItem } from '../lib/Interfaces';

interface TimelinePageList {
  years: number[],
  list: TimelineItem[][]
}

class Timeline {
  mode = ModelTypes.Timeline;
  template = 'timeline.html';
  baseModel: BaseModel;
  constructor (baseModel: BaseModel) {
    this.baseModel = baseModel;
  }
  getTimelines (parenttPath: string): TimelinePageList {
    const res: TimelinePageList = {
      years: [],
      list: []
    };
    const _list: { year: number, list: TimelineItem[] }[] = [];
    this.baseModel.tree.maps.forEach(item => {
      if (item.isDirectory === false && item.parent === parenttPath && item.paths.includes(this.baseModel.tree.listDoc) === false) {
        const _timeline: TimelineItem[] = [];
        if (item.content.timeline) {
          const timeline: TimelineItem[] = item.content.timeline || [];
          timeline.forEach(sub => {
            _timeline.push({
              publishDate: sub.publishDate,
              publishDateDay: this.baseModel.dayjs(sub.publishDate).format('YYYY年MM月DD日'),
              publishDateTime: this.baseModel.dayjs(sub.publishDate).format('HH:mm'),
              title: sub.title,
              desc: sub.desc,
              image: sub.image,
              link: sub.link
            });
          });
        }
        _list.push({
          year: item.content.title,
          list: _timeline
        });
      }
    });
    _list.sort((a, b) => {
      return a.year - b.year;
    });
    _list.forEach(item => {
      res.years.push(item.year);
      res.list.push(item.list);
    });
    return res;
  }
  render (listPath: string): string {
    const modelData = this.baseModel.tree.findByPath(listPath);
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
        current: this.baseModel.mergerHosts(modelData.path)
      };
      const breadcrumb = {
        home: this.baseModel.g.$hosts,
        list: this.baseModel.getBreadcrumb(modelData.paths)
      };
      const main = {
        list: this.getTimelines(modelData.parent),
        current: new Date().getFullYear()
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
      throw new Error(`${listPath} 目录配置错误！`);
    }
  }
}

export default Timeline;
