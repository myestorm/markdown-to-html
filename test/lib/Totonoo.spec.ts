import { expect } from 'chai';
import 'mocha';
import File from 'vinyl';

import Totonoo from '../../src/lib/Totonoo';

// describe('Totonoo.parseMarkdown', () => {
//   it('should return MarkdownParams', () => {
//     // 创建伪文件
//     const fakeFile = new File({
//       contents: Buffer.from(`---
// title: 温州的踪迹
// keywords: [温州的踪迹, 朱自清, 散文]
// desc: 这是一张尺多宽的小小的横幅。
// publishDate: 2020-06-02 06:23:12
// recommend: true
// ---

// ## “月朦胧，鸟朦胧，帘卷海棠红”
//       `)
//     });
//     const result = Totonoo.parseMarkdown(fakeFile);
//     console.log(result);
//     expect(result).to.equal({
//       title: '',
//       keywords: [],
//       desc: '',
//       publishDate: new Date(),
//       recommend: false,
//       body: '<p>1234</p>\n',
//       nav: []
//     });
//   });
// });

describe('Totonoo.pinYin', () => {
  it('should return dong-fang', () => {
    const r1 = Totonoo.pinYin('东方');
    expect(r1).to.equal('dong-fang');
  });
  it('should return dong-fang', () => {
    const r2 = Totonoo.pinYin('1.东方');
    expect(r2).to.equal('dong-fang');
  });
  it('should return 1.-dong-fang', () => {
    const r3 = Totonoo.pinYin('1.东方', false);
    expect(r3).to.equal('1.-dong-fang');
  });
  it('should return dong-fang', () => {
    const r3 = Totonoo.pinYin('1.东     .,方   。，');
    expect(r3).to.equal('dong-fang');
  });
});
