import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import MarkdownItAnchor, { AnchorOptions } from 'markdown-it-anchor';
import FrontMatter, { FrontMatterResult } from 'front-matter';
import { Readable, Transform } from 'readable-stream';
import File from 'vinyl';
import Pinyin from 'pinyin';
import path from 'path';
import fs from 'fs';

import { MarkdownParams, MarkdownTitleNav, ModelTypes } from './T';

import { markdownItAnchor, siteConfig, templateConfig } from '../config/index';

const markdownItAnchorConfig: AnchorOptions = Object.assign({}, {
  level: 1,
  permalink: true,
  permalinkBefore: true,
  permalinkSymbol: '¶'
}, markdownItAnchor);

interface AddFileItem {
  path: string,
  contents: string
}

// 读取模板配置文件
const templateConfigBuffer = fs.readFileSync(path.join(__dirname, '../../', `${templateConfig.root}/${templateConfig.config}`));
const templateConfigString = templateConfigBuffer ? templateConfigBuffer.toString() : '{}';
const templateConfigData = JSON.parse(templateConfigString);

export default abstract class Totonoo {

  siteConfig = siteConfig;
  templateConfig = templateConfig;
  templateConfigData = templateConfigData;

  /**
   * 解析markdown文档
   * @param file File
   */
  static parseMarkdown (file: File): MarkdownParams {
    const nav: MarkdownTitleNav[] = [];
    const _markdownItAnchorConfig = {
      ...markdownItAnchorConfig
    };
    const contents = file.contents || '';
    const fmContents: FrontMatterResult<MarkdownParams> = FrontMatter(contents.toString());
    const attributes = fmContents.attributes;
    const data: MarkdownParams = {
      title: attributes.title || '',
      keywords: attributes.keywords || [],
      desc: attributes.desc || '',
      publishDate: attributes.publishDate ?  new Date(attributes.publishDate).getTime() : new Date().getTime(),
      recommend: !!attributes.recommend,
      cover: attributes.cover || '',
      body: '',
      nav: [],
      mode: attributes.mode || ModelTypes.Article
    };
    let markdownIt = new MarkdownIt();
    _markdownItAnchorConfig.callback = (token: Token, {
      slug,
      title
    }) => {
      nav.push({
        tag: token.tag,
        slug,
        title
      });
    };
    markdownIt = markdownIt.use(MarkdownItAnchor, _markdownItAnchorConfig);
    const body = markdownIt.render(fmContents.body);
    data.body = body;
    data.nav = nav;
    return data;
  }

  /**
   * 汉字转拼音
   * @param str string
   * @param needClear boolean
   */
  static pinYin (str: string, needClear = true): string {
    if (needClear) {
      str = str.replace(/^[0-9]+\./, ''); // 替换开头的 1.等
      str = str.replace(/\s+/g, ''); // 替换空格
      str = str.replace(/[,|.|，|。]/g, ''); // 替换逗号句号
    }
    let py: string = Pinyin(str, {
      style: Pinyin.STYLE_NORMAL
    }).join('-');
    py = py.toLowerCase();
    return py;
  }

  /**
   * 在gulp中加入文件
   * @param files AddFileItem[]
   */
  static addVinylFiles (files: AddFileItem[] = []): Readable {
    const src = new Readable({
      objectMode: true
    });
    src._read = function () {
      files.forEach(item => {
        this.push(new File({
          path: item.path,
          contents: Buffer.from(item.contents)
        }));
      });
      this.push(null);
    };
    return src;
  }

  /**
   * 穿透gulp文件流
   * @param cb Function
   */
  static transform (cb: (file: File, encoding: BufferEncoding, callback: () => void, t: Transform) => void): Transform {
    return new Transform({
      objectMode: true,
      transform: function (file, encoding, callback) {
        if (cb && typeof cb === 'function') {
          cb(file, encoding, callback, this);
        }
        callback(undefined, file);
      }
    });
  }

}
