import { series, parallel, src, dest, watch } from 'gulp';
import htmlmin from 'gulp-htmlmin';
import del from 'del';
import path from 'path';
import browserSync from 'browser-sync';

import { ModelTypes, GulpFileItem } from './src/lib/Interfaces';
import MarkdownToHtml from './src/lib/MarkdownToHtml';
import Tree from './src/lib/Tree';
import BaseModel from './src/lib/BaseModel';
import Home from './src/models/Home';
import Tags from './src/models/Tags';
import Timeline from './src/models/Timeline';
import Collection from './src/models/Collection';
import Normal from './src/models/Normal';
import Single from './src/models/Single';
import Search from './src/models/Search';

const markdownToHtml = new MarkdownToHtml();
const tree = new Tree();

const siteRoot = path.resolve(__dirname, markdownToHtml.config.siteConfig.siteRoot);
const docRoot = path.resolve(__dirname, markdownToHtml.config.docConfig.root);
const templateDir = path.resolve(__dirname, markdownToHtml.config.templateConfig.root);

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
  let files: GulpFileItem[] = [];

  const baseModel = new BaseModel(tree, markdownToHtml);
  const home = new Home(baseModel);
  const tags = new Tags(baseModel);
  const timeline = new Timeline(baseModel);
  const collection = new Collection(baseModel);
  const normal = new Normal(baseModel);
  const single = new Single(baseModel);
  const search = new Search(baseModel);

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
  // 生成搜索
  files.push(search.render());
  files.push({
    path: 'search.json',
    contents: JSON.stringify(search.getSeachData(), null, 4)
  });

  return markdownToHtml.addVinylFiles(files)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(siteRoot));
};

const copyAssets = () => {
  return src([`${templateDir}/assets/**/*.*`])
    .pipe(dest(`${siteRoot}/assets`));
};

const copyFavicon = () => {
  return src([`${templateDir}/favicon.ico`])
    .pipe(dest(siteRoot));
};

const delDirTask = () => {
  return del([`./${path.relative(__dirname, siteRoot)}/**/*`], {
    force: true
  });
};

const copyContentResource = () => {
  return src([`${docRoot}/**/*.{jpg,jpeg,gif,png,svg,mp4,mp3,html,json,txt,webp,htm}`])
    .pipe(markdownToHtml.transform((file) => {
      const dirname = path.relative(__dirname, file.dirname);
      const _arr = dirname.split(path.sep);
      const arr: string[] = [];
      _arr.forEach(item => {
        arr.push(markdownToHtml.pinYin(item, false, false));
      });
      file.dirname = arr.join('/');
    }))
    .pipe(dest(siteRoot));
};

const copyPublic = () => {
  return src(['./public/**/*'])
    .pipe(dest(`${siteRoot}/img`));
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
  watch([`./${siteRoot}/**/*.*`], () => {
    return src(`./${siteRoot}/**/*.*`)
      .pipe(reload({ stream: true }));
  });
};

exports.serve = serve;

exports.default = series(
  delDirTask,
  parallel(
    copyAssets,
    copyFavicon,
    copyContentResource,
    copyPublic,
    series(
      readDocuments,
      generateHtml
    )
  )
);
