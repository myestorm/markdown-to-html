const { series, parallel, src, dest, watch } = require('gulp')
const delDir = require('./core/utils/delDir')
const config = require('./core/config')

const generateCatalogueTask = require('./core/tasks/generateCatalogue')
const generateArticleTask = require('./core/tasks/generateArticle')
const generateHtmlTask = require('./core/tasks/generateHtml')

// 删除所有的生成目录
const delDirTask = () => {
  return delDir([`./${config.data}`])()
}

exports.default = series(
  delDirTask,
  series(
    generateCatalogueTask,
    generateArticleTask
  ),
  parallel(
    generateHtmlTask
  )
)