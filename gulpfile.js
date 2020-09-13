const { series, parallel, src, dest, watch } = require('gulp')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

const delDir = require('./core/utils/delDir')
const { path } = require('./core/utils/utils')
const config = require('./core/config')

const generateCatalogueTask = require('./core/tasks/generateCatalogue')
const generateArticleTask = require('./core/tasks/generateArticle')
const generateHtmlTask = require('./core/tasks/generateHtml')
const generateSingleHtmlTask = require('./core/tasks/generateSingleHtml')

// 删除所有的生成目录
const delDirTask = () => {
  return delDir([`./${config.data}`, `./${config.www}/**/*`])()
}

const copyAssets = () => {
  return src([`./${config.template}/assets/**/*.*`])
    .pipe(dest(`./${config.www}/assets`))
}

/**
 * browser-sync 启用http服务
 */
const serve = () => {
  browserSync.init({
    ui: false,
    server: {
      baseDir: path.resolve(__dirname, 'www'),
      index: 'index.html'
    },
    port: 8080,
    open: false,
    notify: false
  })
  // 监听ejs文件的修改
  watch([`./${config.www}/**/*.*`], () => {
    return src(`./${config.www}/**/*.*`)
      .pipe(reload({ stream: true })) // 刷新浏览器
  })
}

exports.serve = serve

exports.default = series(
  delDirTask,
  series(
    generateCatalogueTask,
    generateArticleTask
  ),
  parallel(
    generateHtmlTask,
    generateSingleHtmlTask,
    copyAssets
  )
)
