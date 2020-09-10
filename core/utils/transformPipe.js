const { Transform } = require('readable-stream')
/**
 * 穿透gulp文件流
 * @param {Function} func 
 */
const transformPipe = (func) => {
  return new Transform({
    objectMode: true,
    transform: function (file, encoding, callback) {
      if (func && typeof func === 'function') {
        func(file, encoding, callback, this)
      }
      callback(null, file)
    }
  })
}
module.exports = transformPipe
