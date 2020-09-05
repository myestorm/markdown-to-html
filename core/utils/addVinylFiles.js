const Vinyl = require('vinyl')
const { Readable } = require('readable-stream')
/**
 * 添加文件
 * @param {Array} files 要添加的文件
 */
const addVinylFiles = (files = []) => {
  const src = Readable({
    objectMode: true
  })
  src._read = function () {
    files.forEach(item => {
      this.push(new Vinyl({
        path: item.path,
        contents: Buffer.from(item.contents)
      }))
    })
    this.push(null)
  }
  return src
}
module.exports = addVinylFiles
