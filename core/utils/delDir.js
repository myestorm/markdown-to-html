const del = require('del')
const delDir = (dir = [], force = true) => {
  return (cb) => {
    return del(dir, {
      force: true
    }, cb)
  }
}
module.exports = delDir
