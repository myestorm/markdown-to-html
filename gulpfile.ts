import { series, src, dest, watch } from 'gulp';
import path from 'path';
import browserSync from 'browser-sync';

import { ModelTypes } from './src/lib/Interfaces';
import MarkdownToHtml from './src/lib/MarkdownToHtml';
import Tree from './src/lib/Tree';
import BaseModel from './src/lib/BaseModel';
import Home from './src/models/Home';
import Tags from './src/models/Tags';
import Timeline from './src/models/Timeline';
import Collection from './src/models/Collection';
import Normal from './src/models/Normal';
import Single from './src/models/Single';

const markdownToHtml = new MarkdownToHtml();
const tree = new Tree();

const siteRoot = path.resolve(__dirname, markdownToHtml.config.siteConfig.siteRoot);

const readDocuments = () => {
  const docRoot = markdownToHtml.config.docConfig.root;
  const files = [`${path.join(__dirname, docRoot)}/**/*.md`];
  return src(files)
    .pipe(markdownToHtml.transform((file) => {
      const data = markdownToHtml.parseMarkdown(file);
      tree.addMapItem(data);
    }))
    .on('end', () => {
      tree.generateTree();
      tree.separatedData();
    });
};

const generateHtml = () => {
  let files = [{
    path: 'tree.json',
    contents: JSON.stringify(tree.list, null, 4)
  }, {
    path: 'maps.json',
    contents: JSON.stringify(Object.fromEntries(tree.dataMaps), null, 4)
  }];

  const baseModel = new BaseModel(tree, markdownToHtml);
  const home = new Home(baseModel);
  const tags = new Tags(baseModel);
  const timeline = new Timeline(baseModel);
  const collection = new Collection(baseModel);
  const normal = new Normal(baseModel);
  const single = new Single(baseModel);

  // 生成列表
  tree.directoryList.forEach(item => {
    if (item.id === 'index') {
      files.push(home.render());
    } else {
      const mode = item.mode;
      switch (mode) {
      case ModelTypes.Collection: {
        files = files.concat(collection.getPageList(item.id));
        break;
      }
      case ModelTypes.Timeline: {
        files.push(timeline.render(item.id));
        break;
      }
      case ModelTypes.Normal: {
        files = files.concat(normal.getPageList(item.id));
        break;
      }
      default: {
        break;
      }
      }
    }
  });
  // 生成文件
  tree.normalList.forEach(item => {
    files.push(normal.render(item.id));
  });
  // 生成文集
  files = files.concat(collection.getBooks());
  // 生成单页
  tree.singleList.forEach(item => {
    const mode = item.mode;
    if (mode === ModelTypes.Tags) {
      files = files.concat(tags.render(item.id));
    } else {
      files.push(single.render(item.id));
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
