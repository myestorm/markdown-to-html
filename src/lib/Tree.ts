import { docConfig } from '../config/index';
import { ModelTypes, MarkdownParseAttribute, SortsItem } from './Interfaces';

class Tree {
  dataMaps = new Map();
  tmpMaps = new Map();

  list: MarkdownParseAttribute[] = [];
  directoryList: MarkdownParseAttribute[] = [];
  directoryListTree: MarkdownParseAttribute[] = [];
  normalList: MarkdownParseAttribute[] = [];
  collectionList: MarkdownParseAttribute[] = [];
  timelineList: MarkdownParseAttribute[] = [];
  singleList: MarkdownParseAttribute[] = [];

  addMapItem (data: MarkdownParseAttribute): void {
    this.dataMaps.set(data.id, data);
    if (data.pid === '') {
      this.list.push(data);
    } else {
      this.tmpMaps.set(data.id, data);
    }
  }

  // 整棵目录文档树
  generateTree (): MarkdownParseAttribute[] {
    const findChildren = (id: string) => {
      const res = [];
      for (const [key, value] of this.tmpMaps.entries()) {
        if (value.pid === id) {
          value.children = findChildren(value.id);
          res.push(value);
          this.tmpMaps.delete(key);
        }
      }
      return res;
    };
    this.list.forEach(item => {
      item.children = findChildren(item.id);
    });
    return this.list;
  }

  checkIsReadme (data: MarkdownParseAttribute): boolean {
    return data.paths.includes(docConfig.listDoc);
  }

  separatedData (): void {
    this.dataMaps.forEach(item => {
      if(this.checkIsReadme(item) === false) {
        const mode = item.mode;
        switch (mode) {
        case ModelTypes.Home: {
          break;
        }
        case ModelTypes.Collection: {
          this.collectionList.push(item);
          break;
        }
        case ModelTypes.Timeline: {
          this.timelineList.push(item);
          break;
        }
        case ModelTypes.Tags: {
          this.singleList.push(item);
          break;
        }
        case ModelTypes.Single: {
          this.singleList.push(item);
          break;
        }
        case ModelTypes.Normal: {
          this.normalList.push(item);
          break;
        }
        default: {
          break;
        }
        }
      } else {
        this.directoryList.push(item);
      }
    });
    const findChildren = (id: string) => {
      const res = this.directoryList.filter(item => item.pid === id);
      if (res.length > 0) {
        res.forEach(item => {
          item.children = findChildren(item.id);
          item.children.sort((a, b) => {
            return this.sorts<MarkdownParseAttribute>(a, b);
          });
        });
      }
      return res;
    };
    this.directoryListTree = findChildren('');

    // 排序
    this.directoryList.sort((a, b) => {
      return this.sorts<MarkdownParseAttribute>(a, b);
    });
    this.normalList.sort((a, b) => {
      return this.sorts<MarkdownParseAttribute>(a, b);
    });
    this.collectionList.sort((a, b) => {
      return this.sorts<MarkdownParseAttribute>(a, b);
    });
    this.timelineList.sort((a, b) => {
      return (+a.title) - (+b.title);
    });
    this.singleList.sort((a, b) => {
      return this.sorts<MarkdownParseAttribute>(a, b);
    });
    this.directoryListTree.sort((a, b) => {
      return this.sorts<MarkdownParseAttribute>(a, b);
    });
  }

  sorts<T extends SortsItem> (a: T, b: T): number {
    let res = a.order - b.order;
    if (res === 0) {
      res = b.publishDate - a.publishDate;
    }
    return res;
  }

  find (id: string): MarkdownParseAttribute | undefined {
    return this.dataMaps.get(id);
  }

}

export default Tree;
