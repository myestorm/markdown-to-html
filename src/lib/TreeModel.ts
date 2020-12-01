import path from 'path';
import File from 'vinyl';

import Totonoo from './Totonoo';
import { TreeNodeItem } from './T';

export default class TreeModel extends Totonoo {
  list: TreeNodeItem[] = [];
  treeMap = new Map();
  docRoot: string;

  constructor (docRoot: string) {
    super();
    this.docRoot = docRoot;
  }

  // 解析URL
  parseDir (file: File, root: string): string[] {
    const rootDir = path.join(file.cwd, root);
    const filePath = file.path.replace(file.extname, '');
    const dir = path.relative(rootDir, filePath);
    const arr = dir.split(path.sep);
    arr.forEach((val, key) => {
      arr[key] = Totonoo.pinYin(val);
      if (key === arr.length - 1 && !file.isDirectory()) {
        arr[key] += '.html';
      }
    });
    return arr;
  }
  // 添加
  addTreeMap (file: File): void {
    const content = Totonoo.parseMarkdown(file);
    const paths = this.parseDir(file, this.docRoot);
    const parent = [...paths];
    const isDirectory = file.isDirectory();
    parent.pop();
    const item: TreeNodeItem = {
      path: paths.join('/'),
      paths: paths,
      parent: parent.join('/'),
      parents: parent,
      extname: file.extname,
      isDirectory,
      order: 0,
      content,
      children: []
    };
    this.treeMap.set(item.path, item);
    if (paths.length === 1) {
      this.list.push(item);
    }
  }
  // 将map转成树
  mapToTree (): void {
    const findChildren = (path: string) => {
      const res = [];
      for (const [key, value] of this.treeMap.entries()) {
        if (value.parent === path) {
          value.children = findChildren(value.path);
          res.push(value);
          this.treeMap.delete(key);
        }
      }
      return res;
    };
    this.list.forEach(item => {
      item.children = findChildren(item.path);
    });
  }
  // 通过path查找数据
  findByPath (filepath: string): TreeNodeItem | undefined {
    const arr = filepath.split('/');
    let tree: TreeNodeItem[] = [...this.list];
    let res;
    arr.reduce((prev: string[], value: string) => {
      prev.push(value);
      const group = tree.find(item => item.path === prev.join('/'));
      if (group) {
        tree = [...group.children];
        res = group;
      } else {
        tree = [];
        res = undefined;
      }
      return prev;
    }, []);
    return res;
  }
}
