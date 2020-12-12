import { TreeNodeItem, MarkdownAttribute, ModelTypes } from './Interfaces';

class Tree {
  listDoc = 'readme';
  list: TreeNodeItem[] = [];
  maps = new Map();
  tmpMaps = new Map();

  constructor (listDoc: string) {
    this.listDoc = listDoc.replace('.md', '.html');
  }

  // 添加数据
  addMapItem (data: TreeNodeItem): void {
    this.maps.set(data.path, data);
    this.tmpMaps.set(data.path, data);
    if (data.paths.length === 1) {
      this.list.push(data);
    }
  }

  // 获取排序数据
  getOrder (data: TreeNodeItem): number {
    const listDoc = this.listDoc;
    const path = data.isDirectory ? `${data.path}/${listDoc}` : data.path;
    const item = this.findByPath(path);
    let order = 1;
    if (item && item.content && item.content.order) {
      order = item.content.order;
    }
    return order;
  }

  getMode (data: TreeNodeItem): ModelTypes {
    const listDoc = this.listDoc;
    const path = data.isDirectory ? `${data.path}/${listDoc}` : data.path;
    const item = this.findByPath(path);
    let mode = ModelTypes.Normal;
    if (item && item.content && item.content.mode) {
      mode = item.content.mode;
    }
    return mode;
  }

  getPublishDate (data: TreeNodeItem): number {
    const listDoc = this.listDoc;
    const path = data.isDirectory ? `${data.path}/${listDoc}` : data.path;
    const item = this.findByPath(path);
    let publishDate = 0;
    if (item && item.content && item.content.publishDate) {
      publishDate = item.content.publishDate;
    }
    return publishDate;
  }

  getContent (data: TreeNodeItem): MarkdownAttribute | undefined {
    const listDoc = this.listDoc;
    const path = data.isDirectory ? `${data.path}/${listDoc}` : data.path;
    const item = this.findByPath(path);
    let res;
    if (item && item.content) {
      res = item.content;
    }
    return res;
  }

  sorts (a: TreeNodeItem, b: TreeNodeItem): number {
    let res = this.getOrder(a) - this.getOrder(b);
    if (res === 0) {
      res = this.getPublishDate(a) - this.getPublishDate(b);
    }
    return res;
  }

  // 创建文档和目录的层级关系
  generateTree (): TreeNodeItem[] {
    const findChildren = (path: string) => {
      const res = [];
      for (const [key, value] of this.tmpMaps.entries()) {
        if (value.parent === path) {
          value.children = findChildren(value.path);
          res.push(value);
          this.tmpMaps.delete(key);
        }
      }
      // 排序
      res.sort((a, b) => {
        return this.sorts(a, b);
      });
      return res;
    };
    // 排序
    this.list.sort((a, b) => {
      return this.sorts(a, b);
    });
    this.list.forEach(item => {
      item.children = findChildren(item.path);
    });

    return this.list;
  }

  // 通过path查找数据
  findByPath (filepath: string): TreeNodeItem | undefined {
    return this.maps.get(filepath);
  }

}
export default Tree;
