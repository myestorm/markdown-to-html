import { expect } from 'chai';
import 'mocha';
import File from 'vinyl';

import MarkdownToHtml from '../../src/lib/MarkdownToHtml';

const markdownToHtml = new MarkdownToHtml();
describe('MarkdownToHtml.parseDir', () => {
  let result = ['tags.md'];
  let fakeFile = new File({
    path: 'C:\\root\\git\\github\\markdown-to-html\\documents\\tags.md',
  });
  it(`should return ${JSON.stringify(result)}`, () => {
    const r = markdownToHtml.parseDir(fakeFile);
    expect(r.join('')).to.equal(result.join(''));
  });

  result = ['tags.md'];
  fakeFile = new File({
    path: 'documents/tags.md',
  });
  it(`should return ${JSON.stringify(result)}`, () => {
    const r = markdownToHtml.parseDir(fakeFile);
    expect(r.join('')).to.equal(result.join(''));
  });

  result = ['test', 'tags.md'];
  fakeFile = new File({
    path: 'documents/test/tags.md',
  });
  it(`should return ${JSON.stringify(result)}`, () => {
    const r = markdownToHtml.parseDir(fakeFile);
    expect(r.join('')).to.equal(result.join(''));
  });

  result = ['..', 'test', 'tags.md'];
  fakeFile = new File({
    path: 'test/tags.md',
  });
  it(`should return ${JSON.stringify(result)}`, () => {
    const r = markdownToHtml.parseDir(fakeFile);
    expect(r.join('')).to.equal(result.join(''));
  });

  result = ['a', 'b', 'c', 'd'];
  fakeFile = new File({
    path: 'documents/a/b/c/d',
  });
  it(`should return ${JSON.stringify(result)}`, () => {
    const r = markdownToHtml.parseDir(fakeFile);
    expect(r.join('')).to.equal(result.join(''));
  });

});
describe('MarkdownToHtml.createId', () => {
  it('should return a/b', () => {
    const r = markdownToHtml.createId(['a', 'b']);
    expect(r).to.equal('a/b');
  });
  it('should return a/b', () => {
    const r = markdownToHtml.createId(['a', 'b', 'readme.md']);
    expect(r).to.equal('a/b');
  });
  it('should return a/b/a.md', () => {
    const r = markdownToHtml.createId(['a', 'b', 'a.md']);
    expect(r).to.equal('a/b/a.md');
  });
});
describe('MarkdownToHtml.createPid', () => {
  it('should return a', () => {
    const r = markdownToHtml.createPid(['a', 'b']);
    expect(r).to.equal('a');
  });
  it('should return a', () => {
    const r = markdownToHtml.createPid(['a', 'b', 'readme.md']);
    expect(r).to.equal('a');
  });
  it('should return a/b', () => {
    const r = markdownToHtml.createPid(['a', 'b', 'a.md']);
    expect(r).to.equal('a/b');
  });

});
describe('MarkdownToHtml.pinYin', () => {
  it('should return dong-fang-b7b800', () => {
    const r1 = markdownToHtml.pinYin('东方', true, false);
    expect(r1).to.equal('dong-fang');
  });
  it('should return dong-fang-b7b800', () => {
    const r2 = markdownToHtml.pinYin('1.东方', true, true);
    expect(r2).to.equal('dong-fang-b7b800');
  });
  it('should return 1.-dong-fang-29dad1', () => {
    const r3 = markdownToHtml.pinYin('1.东方', false, true);
    expect(r3).to.equal('1.-dong-fang-29dad1');
  });
  it('should return dong-fang-b7b800', () => {
    const r3 = markdownToHtml.pinYin('1.东     .,方   。，', true, true);
    expect(r3).to.equal('dong-fang-b7b800');
  });
});
describe('MarkdownToHtml.parseMarkdown', () => {
  it('should return MarkdownParseAttribute', () => {
    // 创建伪文件
    const fakeFile = new File({
      path: 'documents/tags.md',
      contents: Buffer.from(`---
title: 温州的踪迹
keywords: [温州的踪迹, 朱自清, 散文]
desc: 这是一张尺多宽的小小的横幅。
publishDate: 2020-06-02 06:23:12
recommend: 0
---

## “月朦胧，鸟朦胧，帘卷海棠红”
      `)
    });
    const result = markdownToHtml.parseMarkdown(fakeFile);
    expect(JSON.stringify(result)).to.equal(JSON.stringify({
      id: 'tags.md',
      pid: '',
      path: 'tags.md',
      paths: [ 'tags.md' ],
      body: '<h2 id="%E2%80%9C%E6%9C%88%E6%9C%A6%E8%83%A7%EF%BC%8C%E9%B8%9F%E6%9C%A6%E8%83%A7%EF%BC%8C%E5%B8%98%E5%8D%B7%E6%B5%B7%E6%A3%A0%E7%BA%A2%E2%80%9D"><a class="header-anchor" href="#%E2%80%9C%E6%9C%88%E6%9C%A6%E8%83%A7%EF%BC%8C%E9%B8%9F%E6%9C%A6%E8%83%A7%EF%BC%8C%E5%B8%98%E5%8D%B7%E6%B5%B7%E6%A3%A0%E7%BA%A2%E2%80%9D">¶</a> “月朦胧，鸟朦胧，帘卷海棠红”</h2>\n',
      navigation: [
        {
          tag: 'h2',
          slug: '%E2%80%9C%E6%9C%88%E6%9C%A6%E8%83%A7%EF%BC%8C%E9%B8%9F%E6%9C%A6%E8%83%A7%EF%BC%8C%E5%B8%98%E5%8D%B7%E6%B5%B7%E6%A3%A0%E7%BA%A2%E2%80%9D',
          title: '“月朦胧，鸟朦胧，帘卷海棠红”'
        }
      ],
      mode: 'normal',
      title: '温州的踪迹',
      publishDate: 1591050192000,
      icon: '',
      keywords: [ '温州的踪迹', '朱自清', '散文' ],
      desc: '这是一张尺多宽的小小的横幅。',
      order: 1,
      recommend: 0,
      cover: '',
      timeline: [],
      children: []
    }));
  });
});
