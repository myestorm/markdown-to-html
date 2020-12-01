import { series, src, dest } from 'gulp';
import path from 'path';

import Totonoo from './src/lib/Totonoo';
import TreeModel from './src/lib/TreeModel';
import Article from './src/models/Article';

import { docConfig } from './src/config';

const tree = new TreeModel(docConfig.root);

const readDocuments = () => {
  const files = [`${path.join(__dirname, docConfig.root)}/*/**`, `${path.join(__dirname, docConfig.root)}/*.md`];
  return src(files)
    .pipe(Totonoo.transform((file) => {
      // 只需要目录和md文件
      if (file.isDirectory() || file.extname === '.md') {
        tree.addTreeMap(file);
      }
    }))
    .on('end', () => {
      tree.mapToTree();
    });
};

const generateHtml = () => {
  const d = tree.list[2];
  const a = new Article();
  const tmp = a.render(d);
  return Totonoo.addVinylFiles([{
    path: 'tree.json',
    contents: JSON.stringify(tree.list, null, 4)
  }, {
    path: d.path,
    contents: tmp
  }])
    .pipe(dest('./html'));
};

exports.default = series(
  readDocuments,
  generateHtml
);
