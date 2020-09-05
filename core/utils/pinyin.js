const pinyin = require('pinyin')
module.exports = (hanzi = '') => {
  hanzi = hanzi.replace(/^[0-9]+\./, '').replace(/\s+/g, '-').replace(/[，|。]/g, '')
  return pinyin(hanzi, {
    style: pinyin.STYLE_NORMAL
  }).join('-').toLowerCase()
}
