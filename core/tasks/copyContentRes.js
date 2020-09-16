const { series, parallel, src, dest } = require('gulp')

const { getRoot, joinPath, stringify, path, formatDatetime } = require('../utils/utils')

const transformPipe = require('../utils/transformPipe')
const pinyin = require('../utils/pinyin')
const config = require('../config')

/**
 * 复制 内容资源
 */
const copyContentRes = () => {
  return src([`./${config.documents}/**/*.{jpg,jpeg,gif,png,html,json,txt,webp,css,scss,js,htm,jsx,vue}`])
    .pipe(transformPipe((file) => {
      let dirname = path.relative(getRoot(), file.dirname)
      dirname = dirname.replace(/\\/g, '/')
      const _arr = dirname.split('/')
      const arr = []
      _arr.forEach(item => {
        arr.push(pinyin(item))
      })
      file.dirname = arr.join('/')
    }))
    .pipe(dest(`./${config.www}/`))
}

module.exports = copyContentRes
