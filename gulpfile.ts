const { series, src } = require('gulp');
const task = () => {
  console.log('tests')
  return src('package.json')
}

exports.default = series(
  task
);
