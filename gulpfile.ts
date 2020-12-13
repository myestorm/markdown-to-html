import { series, src, dest, watch } from 'gulp';
import path from 'path';
import browserSync from 'browser-sync';

import { TreeNodeItem, MarkdownAttribute, ModelTypes } from './src/lib/Interfaces';
import MarkdownToHtml from './src/lib/MarkdownToHtml';
import Tree from './src/lib/Tree';
import Home from './src/models/Home';
import NormalList from './src/models/NormalList';
import Normal from './src/models/Normal';
import CollectionList from './src/models/CollectionList';

const markdownToHtml = new MarkdownToHtml();
const tree = new Tree(markdownToHtml.config.docConfig.listDoc);
const siteRoot = path.resolve(__dirname, markdownToHtml.config.siteConfig.siteRoot);

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
  const normalList = new NormalList(tree, markdownToHtml);
  const normal = new Normal(tree, markdownToHtml);
  const collectionList = new CollectionList(tree, markdownToHtml);

  // 遍历生成数据
  tree.maps.forEach(item => {
    if (item.isDirectory === false) {
      const mode = tree.getMode(item);
      if (item.paths.includes(tree.listDoc)) {
        const _path = item.path.replace(tree.listDoc, 'index.html');
        if (mode === ModelTypes.Home) {
          files.push({
            path: _path,
            contents: home.render()
          });
        } else if (mode === ModelTypes.Collection) {
          const listPage = collectionList.creatPages(item.path);
          listPage.forEach(item => {
            files.push(item);
          });
        } else if (mode === ModelTypes.Normal) {
          const listPage = normalList.creatPages(item.path);
          listPage.forEach(item => {
            files.push(item);
          });
        }
      } else {
        if (mode === ModelTypes.Collection) {
          console.log(123);
        } else if (mode === ModelTypes.Timeline) {
          console.log(456);
        } else if (mode === ModelTypes.Tags) {
          console.log(789);
        } else if (mode === ModelTypes.Single) {
          console.log(124);
        } else if (mode === ModelTypes.Normal) {
          files.push({
            path: item.path,
            contents: normal.render(item.path)
          });
        }
      }
    }
  });

  return markdownToHtml.addVinylFiles(files)
    .pipe(dest(siteRoot));
};

/**
 * browser-sync 启用http服务
 */
const browserSyncSevice = browserSync.create();
const reload = browserSyncSevice.reload;
const serve = () => {
  browserSync.init({
    ui: false,
    server: {
      baseDir: siteRoot,
      index: 'index.html'
    },
    port: 8080,
    open: false,
    notify: false
  });
  // 监听ejs文件的修改
  watch([`./${siteRoot}/**/*.*`], () => {
    return src(`./${siteRoot}/**/*.*`)
      .pipe(reload({ stream: true }));
  });
};

exports.serve = serve;

exports.default = series(
  readDocuments,
  generateHtml
);
