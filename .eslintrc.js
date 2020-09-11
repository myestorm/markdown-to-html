module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    node: true,
    browser: true
  },
  extends: 'standard',
  globals: {
    $: true,
    jQuery: true
  }
}
