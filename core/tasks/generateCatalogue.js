const { series, src, dest } = require('gulp')

const { getRoot, joinPath, stringify, path } = require('../utils/utils')
const parseMarkdown = require('../utils/parseMarkdown')
const transformPipe = require('../utils/transformPipe')
const addVinylFiles = require('../utils/addVinylFiles')
const pinyin = require('../utils/pinyin')
const config = require('../config')

/**
 * 目录（分类）树形数据
 */
let maxLevel = 0
const treeData = {
  list: [],
  maps: {}
}
/**
 * 生成所有目录（分类）数据
 */
const generateCatalogue = () => {
  const docRoot = joinPath(getRoot(), config.documents)
  return src(`${docRoot}/**/${config.defaultMD}`)
    .pipe(transformPipe((file) => {
      let arr = []
      const data = Object.assign({}, {
        title: '',
        keywords: [],
        desc: '',
        cover: '' // 头图
      }, parseMarkdown(file))
      const filepath = path.relative(docRoot, file.path)
      arr = filepath.split(/[/|\\]/)
      arr.pop()
      // 处理中文目录
      arr.forEach((item, index) => {
        arr[index] = pinyin(item)
      })
      // 配置默认值
      if (!data.mode) {
        if (filepath === config.defaultMD) {
          data.mode = 'home'
        } else {
          data.mode = 'normal'
        }
      }
      if (!data.order) {
        data.order = 999
      }
      data.count = 0
      data.pageSize = config.pageSize
      data.list = []
      data.filepath = arr
      // 处理树形结构
      treeData.maps[(arr.join('/') || 'homepage')] = {
        ...data
      }
      if (arr.length > maxLevel) {
        maxLevel = arr.length
      }

      file.dirname = config.documents + '/' + arr.join('/')
      file.extname = '.json'
      file.contents = Buffer.from(stringify(data))
    }))
    .pipe(dest(`./${config.data}`))
}

const generateCatalogueTree = () => {
  const _treeData = { ...treeData.maps }
  delete _treeData.homepage

  const findByLen = (len) => {
    const res = []
    Object.keys(_treeData).forEach(key => {
      const item = _treeData[key]
      if (item.filepath.length === len) {
        res.push({
          _id: key,
          ...item,
          children: []
        })
        delete _treeData[key]
      }
    })
    return res
  }
  const findParent = (filepath = []) => {
    let res = treeData.list
    filepath.forEach((item, index) => {
      const target = []
      for (let i = 0; i < index; i++) {
        target[i] = filepath[i]
      }
      const idx = res.findIndex(sub => {
        return JSON.stringify(target) === JSON.stringify(sub.filepath)
      })
      if (idx > -1) {
        res = res[idx].children
      }
    })
    return res
  }
  for (let i = 1; i <= maxLevel; i++) {
    const list = findByLen(i)
    if (i === 1) {
      treeData.list = list
    } else {
      list.forEach(item => {
        findParent(item.filepath).push(item)
      })
    }
  }

  // 分类排序
  const sortCatalogue = (arr = []) => {
    arr.sort((a, b) => {
      return a.order - b.order
    })
    arr.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortCatalogue(item.children)
      }
    })
  }
  sortCatalogue(treeData.list)

  return addVinylFiles([{
    path: 'tree.json',
    contents: stringify(treeData)
  }])
    .pipe(dest(`./${config.data}`))
}

module.exports = series(
  generateCatalogue,
  generateCatalogueTree
)
