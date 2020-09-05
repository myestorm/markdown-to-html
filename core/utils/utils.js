const path = require('path')
const moment = require('moment')
module.exports = {
  path,
  formatDatetime: (str) => {
    const type = 'YYYY-MM-DD HH:mm:ss'
    return str ? moment(str).format(type) : moment().format(type)
  },
  joinPath: path.join,
  stringify: (data) => {
    return JSON.stringify(data, null, 4)
  },
  getRoot: () => {
    return path.join(__dirname, '../../')
  }
}