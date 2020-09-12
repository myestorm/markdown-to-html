const { series, parallel, src, dest } = require('gulp')
const rename = require('gulp-rename')
const htmlmin = require('gulp-htmlmin')
const ejs = require('ejs')
const Vinyl = require('vinyl')

const { path, formatDatetime, getRoot, joinPath } = require('../utils/utils')
const transformPipe = require('../utils/transformPipe')
const addVinylFiles = require('../utils/addVinylFiles')
const config = require('../config')

const readmeJson = config.defaultMD.replace('.md', '.json')

let tree = null
let tags = null
let templateConfig = null
let allData = []
const tagsList = []

// 读取数据
const readJsonData = () => {
  return src([`${config.data}/tree.json`, `${config.data}/tags.json`, `${config.data}/all.json`, './template/config.json'])
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
      if (file.basename === 'all.json') {
        allData = JSON.parse(file.contents.toString())
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
// 列表分页
const mkListPages = (total = 0, pagesize = 10, filename = 'index', ext = '.html') => {
  const pages = []
  const pageCount = Math.ceil(total / pagesize)
  const sizes = 2
  for (let i = 1; i <= pageCount; i++) {
    let item = []
    const prev = {
      title: '上一页',
      path: i - 1 === 1 ? `${filename}${ext}` : `${filename}_${i - 1}${ext}`,
      disabled: (i === 1)
    }
    const next = {
      title: '下一页',
      path: `${filename}_${i + 1}${ext}`,
      disabled: (i === pageCount)
    }
    const center = []

    item.push(prev)

    for (let j = 1; j <= pageCount; j++) {
      center.push({
        title: j,
        path: j === 1 ? `${filename}${ext}` : `${filename}_${j}${ext}`,
        disabled: false,
        isCurrent: i === j
      })
    }
    if (pageCount >= (sizes * 2) + 1) {
      const ell = { title: '...', path: '', disabled: true }
      let ss = 0
      let se = 0
      let es = 0
      let ee = 0
      if (i < (sizes * 2 + 1)) {
        ss = (sizes * 2 + 1) + 2 - 1
        se = pageCount - ss - 1
        center.splice(ss, se, ell)
      } else if (i > pageCount - sizes * 2) {
        es = 1
        ee = pageCount - 2 - (sizes * 2 + 1)
        center.splice(es, ee, ell)
      } else {
        ss = 1
        se = i - sizes - ss - 1
        center.splice(ss, se, ell)
        es = i + sizes
        ee = pageCount - es - 1
        center.splice(es - (se - 1), ee, ell)
      }
    }
    item = item.concat(center)
    item.push(next)

    pages.push(item)
  }
  return pages
}
// 所有的列表
const generateListsHtml = () => {
  return src([`./${config.data}/**/${readmeJson}`, `!./${config.data}/${readmeJson}`])
    .pipe(transformPipe((file, encoding, callback, stream) => {
      const contents = JSON.parse(file.contents.toString())
      const template = getTemplate(contents.mode, 'list')
      const assets = getAssetsConfig('categories')

      const count = contents.count
      const pageSize = contents.pageSize
      const list = [...contents.list]
      const filepath = contents.filepath.join('/')
      const pages = mkListPages(count, pageSize, `${config.host}${filepath}/index`)
      const data = {
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
          list: [],
          pages: []
        },
        footer: {
          beian: config.beian
        },
        scripts: assets.scripts
      }
      pages.forEach((item, index) => {
        let html = ''
        data.main.list = list.splice(0, pageSize)
        data.main.pages = item
        html = renderEjs(template, data)
        if (index === 0) {
          file.basename = 'index'
          file.contents = Buffer.from(html)
        } else {
          const _file = new Vinyl({
            path: `${filepath}/index_${index + 1}.html`,
            contents: Buffer.from(html)
          })
          stream.push(_file)
        }
      })
    }))
    .pipe(rename({ extname: '.html' }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(`${config.www}/`))
}
// tags页面
const generateTagsHtml = () => {
  const files = []
  const templateIndex = getTemplate('tags', 'index')
  const assetsIndex = getAssetsConfig('tags')
  const dataIndex = {
    global: $g,
    head: {
      title: `标签聚合 - ${config.sitename}`,
      keywords: ['标签聚合'],
      desc: '标签聚合',
      styles: assetsIndex.styles
    },
    header: {
      current: 0
    },
    main: {
      list: tagsList
    },
    footer: {
      beian: config.beian
    },
    scripts: assetsIndex.scripts
  }
  const htmlIndex = renderEjs(templateIndex, dataIndex)
  files.push({
    path: 'index.html',
    contents: htmlIndex
  })
  // tags列表
  const template = getTemplate('tags', 'list')
  const assets = getAssetsConfig('categories')
  tagsList.forEach(item => {
    const data = {
      global: $g,
      head: {
        title: `${item.title} - ${config.sitename}`,
        keywords: item.keywords || [],
        desc: item.desc || '',
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
          list: [{
            title: '标签聚合',
            path: `${config.host}tags/index.html`
          }, {
            title: item.title,
            path: $g.mkArticleLink(item.filepath, item.filename)
          }],
          countInfo: {
            title: item.title,
            count: item.count
          }
        },
        list: [],
        pages: []
      },
      footer: {
        beian: config.beian
      },
      scripts: assets.scripts
    }
    const pages = mkListPages(item.count, item.pageSize, `${config.host}tags/${item.filename}`)
    pages.forEach((page, index) => {
      let html = ''
      data.main.list = item.list.splice(0, item.pageSize)
      data.main.pages = page
      html = renderEjs(template, data)
      const file = {
        path: index === 0 ? `${item.filename}.html` : `${item.filename}_${index + 1}.html`,
        contents: html
      }
      files.push(file)
    })
  })
  return addVinylFiles(files)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(`${config.www}/tags/`))
}
// 所有文章
const generateArticleHtml = () => {
  const files = []
  const template = getTemplate('normal', 'article')
  const assets = getAssetsConfig('detail')
  const len = allData.length
  allData.forEach((item, index) => {
    const data = {
      global: $g,
      head: {
        title: `${item.title} - ${config.sitename}`,
        keywords: item.keywords || [],
        desc: item.desc || '',
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
        content: item,
        related: {
          prev: index === 0 ? allData[len - 1] : allData[index - 1],
          next: index === len - 1 ? allData[0] : allData[index + 1]
        }
      },
      footer: {
        beian: config.beian
      },
      scripts: assets.scripts
    }
    const html = renderEjs(template, data)
    const file = {
      path: `${item.filepath.join('/')}/${item.filename}.html`,
      contents: html
    }
    files.push(file)
  })
  return addVinylFiles(files)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest(`${config.www}/`))
}
module.exports = series(
  readJsonData,
  parallel(
    generateIndexHtml,
    generateListsHtml,
    generateTagsHtml,
    generateArticleHtml
  )
)
