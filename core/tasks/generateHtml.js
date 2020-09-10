const { series, parallel, src, dest } = require('gulp')
const rename = require('gulp-rename')
const htmlmin = require('gulp-htmlmin')
const ejs = require('ejs')
const Vinyl = require('vinyl')

const { path, formatDatetime, getRoot, joinPath } = require('../utils/utils')
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
    return `${config.host}${config.assets}/${str}`
  },
  mkArticleLink (filepath, filename) {
    return `${config.host}${filepath.join('/')}/${filename}.html`
  },
  mkTagsLink (tag) {
    const item = tags[tag]
    return $g.mkArticleLink(item.filepath, item.filename)
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

// 首页
const generateIndexHtml = () => {
  return src(`./${config.data}/${readmeJson}`)
    .pipe(transformPipe((file) => {
      const contents = JSON.parse(file.contents.toString())
      const template = getTemplate(contents.mode, 'index')
      const assets = getAssetsConfig('index')
      const html = renderEjs(template, {
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
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(`${config.www}/`))
}

// 面包屑
const mkBreadcrumbs = (filepath = []) => {
  const res = []
  for (let i = 0; i < filepath.length; i++) {
    const key = filepath.slice(0, (i + 1)).join('/')
    const item = tree.maps[key]
    res.push({
      title: item.title,
      path: $g.mkArticleLink(item.filepath, 'index')
    })
  }
  return res
}
// 所有的列表
const generateListsHtml = () => {
  return src([`./${config.data}/**/${readmeJson}`, `!./${config.data}/${readmeJson}`])
    .pipe(transformPipe((file, encoding, callback, stream) => {
      const contents = JSON.parse(file.contents.toString())
      const template = getTemplate(contents.mode, 'list')
      const assets = getAssetsConfig('categories')
      stream.push(new Vinyl({
        path: 'test/file.js',
        contents: new Buffer('var x = 123')
      }))
      const html = renderEjs(template, {
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
          breadcrumbs: {
            list: mkBreadcrumbs(contents.filepath),
            countInfo: {
              title: contents.title,
              count: contents.count
            }
          },
          list: []
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
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(`${config.www}/`))
}
module.exports = series(
  readJsonData,
  parallel(
    generateIndexHtml,
    generateListsHtml
  )
)
