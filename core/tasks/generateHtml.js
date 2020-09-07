const { series, parallel, src, dest } = require('gulp')
const rename = require('gulp-rename')
const htmlmin = require('gulp-htmlmin')
const ejs = require('ejs')

const { path, formatDatetime } = require('../utils/utils')
const transformPipe = require('../utils/transformPipe')
const config = require('../config')
const moment = require('moment')

const readmeJson = config.defaultMD.replace('.md', '.json')

let tree = null
let tags = null
let tagsList = []
let templateConfig = null

// 读取数据
const readJsonData = () => {
  return src([`${config.data}/tree.json`, `${config.data}/tags.json`, `./template/config.json`])
    .pipe(transformPipe((file) => {
      if (file.basename === 'tree.json') {
        tree = JSON.parse(file.contents.toString())
      }
      if (file.basename === 'tags.json') {
        tags = JSON.parse(file.contents.toString())
        Object.keys(tags).forEach(item => {
          tagsList.push(tags[item])
        })
        tagsList.sort((a, b) => {
          return b.count - a.count
        })
      }
      if (file.basename === 'config.json') {
        templateConfig = JSON.parse(file.contents.toString())
      }
    }))
}

const $g = {
  host: config.host,
  assets: config.assets,
  path: path.resolve(__dirname, '../../template/'),
  formatDatetime,
  mkAssetsLink (str) {
    return `./${config.assets}/${str}`
  },
  mkArticleLink (filepath, filename) {
    return `./${filepath.join('/')}/${filename}.html`
  },
  mkTagsLink (tag) {
    const item = tags[tag]
    return $g.mkArticleLink(item.filepath, item.filename)
  }
}

const generateIndexHtml = () => {
  return src(`./${config.data}/${readmeJson}`)
    .pipe(transformPipe((file) => {
      const contents = JSON.parse(file.contents.toString())
      const template = './template/index/index.ejs'
      const assets = templateConfig['index.html']
      const ejsTemp = ejs.fileLoader(template)
      const html = ejs.render(ejsTemp.toString(), {
        global: $g,
        head: {
          title: config.sitename,
          keywords: contents.keywords || [],
          desc: contents.desc || '',
          styles: assets.styles
        },
        header: {
          current: 0
        },
        aside: {
          categories: tree.list,
          tags: tagsList
        },
        main: {
          lastData: contents.list[0],
          recommendData: contents.list[1]
        },
        footer: {
          beian: config.beian
        },
        scripts: assets.scripts
      })
      file.basename = 'index'
      file.contents = Buffer.from(html)
    }))
    .pipe(rename({ extname: '.html' }))
    // .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(`${config.www}/`))
}
module.exports = series(
  readJsonData,
  generateIndexHtml
)
