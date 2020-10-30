const { series, parallel, src, dest } = require('gulp')
const ejs = require('ejs')
const rename = require('gulp-rename')
const htmlmin = require('gulp-htmlmin')
const { getRoot, joinPath, path, formatDatetime } = require('../utils/utils')
const transformPipe = require('../utils/transformPipe')
const parseMarkdown = require('../utils/parseMarkdown')
const config = require('../config')
const docRoot = joinPath(getRoot(), config.documents)

let templateConfig = null
let tree = null

// 读取数据
const readJsonData = () => {
  return src([`${config.data}/tree.json`, './template/config.json'])
    .pipe(transformPipe((file) => {
      if (file.basename === 'tree.json') {
        tree = JSON.parse(file.contents.toString())
      } else {
        templateConfig = JSON.parse(file.contents.toString())
      }
    }))
}

const $g = {
  host: config.host,
  assets: config.assets,
  path: path.resolve(__dirname, '../../template/'),
  formatDatetime,
  mkArticleLink (filepath, filename) {
    return `${config.host}${filepath.join('/')}/${filename}.html`
  },
  mkAssetsLink (str) {
    return `${config.host}${config.assets}/${str}`
  }
}

// 获取模板文件
const getTemplate = (mode, type) => {
  const templateTypes = config.templateTypes
  const filepath = joinPath(templateTypes[mode].dir, templateTypes[mode][type])
  return joinPath(getRoot(), config.template, filepath)
}

// 获取模板中的静态资源配置
const getAssetsConfig = (type) => {
  return templateConfig[`${type}.html`]
}

// 渲染数据
const renderEjs = (template, data) => {
  const ejsTemp = ejs.fileLoader(template)
  const html = ejs.render(ejsTemp.toString(), data)
  return html
}

const generateSingleHtml = () => {
  const files = [`${docRoot}/about.md`]
  return src(files)
    .pipe(transformPipe((file) => {
      const content = parseMarkdown(file, true)
      const template = getTemplate('single', 'index')
      const assets = getAssetsConfig('about')
      const data = {
        global: $g,
        head: {
          title: `${content.title} - ${config.sitename}`,
          keywords: content.keywords || [],
          desc: content.desc || [],
          styles: assets.styles
        },
        header: {
          current: 5
        },
        aside: {
          categories: tree.list,
          current: ''
        },
        main: {
          content
        },
        footer: {
          beian: config.beian
        },
        scripts: assets.scripts
      }
      const html = renderEjs(template, data)
      file.contents = Buffer.from(html)
    }))
    .pipe(rename({ extname: '.html' }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(`./${config.www}`))
}

const generateTimelineHtml = () => {
  const files = [`${docRoot}/timeline.md`]
  return src(files)
    .pipe(transformPipe((file) => {
      const content = parseMarkdown(file, true)
      const template = getTemplate('timeline', 'index')
      const assets = getAssetsConfig('timeline')
      const data = {
        global: $g,
        head: {
          title: `${content.title} - ${config.sitename}`,
          keywords: content.keywords || [],
          desc: content.desc || [],
          styles: assets.styles
        },
        header: {
          current: 4
        },
        aside: {
          categories: tree.list,
          current: ''
        },
        main: {
          list: content.timeline
        },
        footer: {
          beian: config.beian
        },
        scripts: assets.scripts
      }
      const html = renderEjs(template, data)
      file.contents = Buffer.from(html)
    }))
    .pipe(rename({ extname: '.html' }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(`./${config.www}`))
}

module.exports = series(
  readJsonData,
  parallel(
    generateSingleHtml,
    generateTimelineHtml
  )
)
