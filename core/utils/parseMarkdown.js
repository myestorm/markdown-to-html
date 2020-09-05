const MarkdownIt = require('markdown-it')
const markdownItAnchor = require('markdown-it-anchor')
const frontMatter = require('front-matter')

const config = require('../config')

const parseMarkdown = (file, isAnchor = false) => {
  let res = {}
  // 抽取YAML配置
  const fmContents = frontMatter(file.contents.toString())
  const navigation = [] // 右侧导航
  res = {
    ...fmContents.attributes
  }
  let markdownIt = new MarkdownIt()
  if (isAnchor) {
    const markdownItAnchorConfig = Object.assign({}, {
      level: 1,
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '¶'
    }, config.markdownItAnchor)
    markdownItAnchorConfig.callback = (token, {
      slug,
      title
    }) => {
      navigation.push({
        tag: token.tag,
        slug,
        title
      })
      if (config.markdownItAnchor.callback && typeof config.markdownItAnchor.callback === 'function') {
        config.markdownItAnchor.callback(token, {
          slug,
          title
        })
      }
    }
    markdownIt = markdownIt.use(markdownItAnchor, markdownItAnchorConfig)
  }
  const body = markdownIt.render(fmContents.body) // 将md解析成html
  res.body = body
  if (isAnchor) {
    res.navigation = navigation
  }
  return res
}

module.exports = parseMarkdown
