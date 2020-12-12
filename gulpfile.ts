import { series, src, dest } from 'gulp';
import path from 'path';

import { TreeNodeItem, MarkdownAttribute } from './src/lib/Interfaces';
import MarkdownToHtml from './src/lib/MarkdownToHtml';
import Tree from './src/lib/Tree';
import Home from './src/models/Home';

const markdownToHtml = new MarkdownToHtml();
const tree = new Tree(markdownToHtml.config.docConfig.listDoc);

const readDocuments = () => {
  const docRoot = markdownToHtml.config.docConfig.root;
  const files = [`${path.join(__dirname, docRoot)}/*/**`, `${path.join(__dirname, docRoot)}/*.md`];
  return src(files)
    .pipe(markdownToHtml.transform((file) => {
      if (file.isDirectory() || file.extname === '.md') {
        const paths = markdownToHtml.parseDir(file);
        const content: MarkdownAttribute = markdownToHtml.parseMarkdown(file);
        const parents = [...paths];
        const isDirectory = file.isDirectory();
        parents.pop();
        const item: TreeNodeItem = {
          path: paths.join('/'),
          paths: paths,
          parent: parents.join('/'),
          parents: parents,
          extname: file.extname,
          isDirectory,
          content,
          children: []
        };
        tree.addMapItem(item);
      }
    }))
    .on('end', () => {
      tree.generateTree();
    });
};

const generateHtml = () => {
  const files = [{
    path: 'tree.json',
    contents: JSON.stringify(tree.list, null, 4)
  }, {
    path: 'maps.json',
    contents: JSON.stringify(Object.fromEntries(tree.maps), null, 4)
  }];
  const home = new Home(tree, markdownToHtml);
  files.push({
    path: 'index.html',
    contents: home.render()
  });
  return markdownToHtml.addVinylFiles(files)
    .pipe(dest('./html'));
};

exports.default = series(
  readDocuments,
  generateHtml
);
