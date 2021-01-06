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
  TimelineItem
} from '../lib/Interfaces';

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
  getTimelines (): TimelinePageList {
    const res: TimelinePageList = {
      years: [],
      list: []
    };
    this.baseModel.$t.timelineList.forEach(item => {
      interface SubsItem extends TimelineItem {
        publishDateDay: string,
        publishDateTime: string
      }
      const subs: SubsItem[] = [];
      if (item.timeline) {
        item.timeline.forEach(sub => {
          const _sub: SubsItem = {
            ...sub,
            publishDateDay: this.baseModel.getDayjs(sub.publishDate).format('YYYY年MM月DD日'),
            publishDateTime: this.baseModel.getDayjs(sub.publishDate).format('HH:mm')
          };
          subs.push(_sub);
        });
      }
      res.years.push(+item.title);
      res.list.push(subs);
    });
    return res;
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
        list: this.getTimelines(),
        current: new Date().getFullYear()
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
      path: filepath,
      contents: html
    };
  }
}

export default Timeline;
