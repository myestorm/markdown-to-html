const { series, parallel, src, dest } = require('gulp')

const { getRoot, joinPath, stringify, path, formatDatetime } = require('../utils/utils')
const parseMarkdown = require('../utils/parseMarkdown')
const transformPipe = require('../utils/transformPipe')
const addVinylFiles = require('../utils/addVinylFiles')
const pinyin = require('../utils/pinyin')
const config = require('../config')
const docRoot = joinPath(getRoot(), config.documents)

const allArticle = []
const allTags = {}
/**
 * 生成所有文章的数据
 */
const generateArticle = () => {
  const files = [`${docRoot}/**/*.md`, `!${docRoot}/**/${config.defaultMD}`]
  return src(files)
    .pipe(transformPipe((file) => {
      let arr = []
      const data = Object.assign({}, {
        title: '',
        keywords: [],
        desc: '',
        cover: '', // 头图
        publishDate: formatDatetime(), // 发布时间
        recommend: false // 推荐到首页显示
      }, parseMarkdown(file, true))
      const filepath = path.relative(joinPath(getRoot(), config.documents), file.path)
      // 处理文件名
      const basename = file.basename.replace(file.extname, '').trim()
      data.filename = pinyin(basename)
      arr = filepath.split(/[\/|\\]/)
      arr.pop()
      // 处理中文目录
      arr.forEach((item, index) => {
        arr[index] = pinyin(item)
      })
      // 配置默认值
      if (!data.mode) {
        data.mode = 'normal'
      }
      if (!data.order) {
        data.order = 999
      }
      data.filepath = arr
      allArticle.push(data)
      file.dirname = config.documents + '/' + arr.join('/')
      file.basename = data.filename
      file.extname = '.json'
      file.contents = Buffer.from(stringify(data))

      // 分离tags
      const keywords = data.keywords
      const tagItem = {
        title: data.title,
        keywords: data.keywords,
        desc: data.desc,
        cover: data.cover,
        publishDate: data.publishDate,
        recommend: data.recommend,
        order: data.order,
        filepath: data.filepath,
        filename: data.filename
      }
      keywords.forEach(keyword => {
        if (allTags[keyword]) {
          allTags[keyword].list.push(tagItem)
          allTags[keyword].count++
        } else {
          allTags[keyword] = {
            title: keyword,
            keywords: [
              keyword
            ],
            desc: `与${keyword}相关的文章`,
            cover: '',
            order: 999,
            body: '',
            mode: 'tags',
            count: 1,
            pageSize: config.pageSize,
            list: [tagItem],
            filepath: ['tags'],
            filename: pinyin(keyword)
          }
        }
      })
    }))
    .pipe(dest(`./${config.data}`))
}

/**
 * 更新分类的文章数据
 */
const updateCatalogue = () => {
  const filename = config.defaultMD.replace(/\.md$/, '.json')
  // 所有文档排序
  allArticle.sort((a, b) => {
    if (a.order !== b.order) {
      return a.order - b.order
    } else {
      return new Date(b.publishDate) - new Date(a.publishDate)
    }
  })
  const findArticleByPath = (filepath = []) => {
    let res = []
    if (filepath.length === 0) { // 首页
      const recommend = allArticle.filter(item => item.recommend)
      const newest = allArticle.slice(0, 9)
      res[0] = recommend
      res[1] = newest
    } else {
      const str = '\/\/\/'
      filepath = filepath.join(str) 
      res = allArticle.filter((item) => {
        const i = item.filepath.join(str)
        return new RegExp(`^${filepath}`).test(i)
      })
    }
    return res
  }
  return src(`${config.data}/**/${filename}`)
    .pipe(transformPipe((file) => {
      const contents = JSON.parse(file.contents.toString())
      const list = findArticleByPath(contents.filepath)
      contents.list = list
      contents.count = list.length
      file.contents = Buffer.from(stringify(contents))
    }))
    .pipe(dest(`./${config.data}`))
}

/**
 * 所有数据
 */
const generateAllData = () => {
  return addVinylFiles([{
    path: 'all.json', 
    contents: stringify(allArticle)
  }])
    .pipe(dest(`./${config.data}`))
}

/**
 * 所有tags数据
 */
const generateTagsData = () => {
  return addVinylFiles([{
    path: 'tags.json', 
    contents: stringify(allTags)
  }])
    .pipe(dest(`./${config.data}`))
}

module.exports = series(
  generateArticle,
  parallel(
    updateCatalogue,
    generateAllData,
    generateTagsData
  )
)
