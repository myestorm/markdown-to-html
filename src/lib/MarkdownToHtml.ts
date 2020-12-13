import path from 'path';
import fs from 'fs';
import File from 'vinyl';
import Pinyin from 'pinyin';
import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import MarkdownItAnchor, { AnchorOptions } from 'markdown-it-anchor';
import FrontMatter, { FrontMatterResult } from 'front-matter';
import { Readable, Transform } from 'readable-stream';
import { markdownItAnchor, siteConfig, templateConfig, docConfig } from '../config/index';
import { MarkdownAttribute, MarkdownNavigation, ModelTypes, AddFileItem } from './Interfaces';

const markdownItAnchorConfig: AnchorOptions = Object.assign({}, {
  level: 1,
  permalink: true,
  permalinkBefore: true,
  permalinkSymbol: '¶'
}, markdownItAnchor);

// 读取模板配置文件
const templateConfigBuffer = fs.readFileSync(path.join(__dirname, '../../', `${templateConfig.root}/${templateConfig.config}`));
const templateConfigString = templateConfigBuffer ? templateConfigBuffer.toString() : '{}';
const templateConfigData = JSON.parse(templateConfigString);

class MarkdownToHtml {
  config = {
    markdownItAnchorConfig,
    siteConfig,
    templateConfig,
    docConfig,
    templateConfigData
  };

  /**
   * 解析markdown文档
   * @param file File
   */
  parseMarkdown (file: File): MarkdownAttribute {
    const nav: MarkdownNavigation[] = [];
    const _markdownItAnchorConfig = {
      ...this.config.markdownItAnchorConfig
    };
    const contents = file.contents || '';
    const fmContents: FrontMatterResult<MarkdownAttribute> = FrontMatter(contents.toString());
    const attributes = fmContents.attributes;
    const zoneOffset = new Date().getTimezoneOffset() * 1000 * 60;
    const data: MarkdownAttribute = {
      title: attributes.title,
      keywords: attributes.keywords || [],
      desc: attributes.desc || '',
      publishDate: attributes.publishDate ?  (new Date(attributes.publishDate).getTime() + zoneOffset) : new Date().getTime(),
      order: attributes.order || 1,
      icon: attributes.icon || '',
      recommend: attributes.recommend || 0,
      mode: attributes.mode || ModelTypes.Normal,
      cover: attributes.cover || '',
      body: '',
      navigation: []
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
    data.navigation = nav;
    return data;
  }

  /**
   * 解析文档URL
   * @param file File
   * @param root string
   */
  parseDir (file: File): string[] {
    const rootDir = path.join(file.cwd, this.config.docConfig.root);
    const filePath = file.path.replace(file.extname, '');
    const dir = path.relative(rootDir, filePath);
    const arr = dir.split(path.sep);
    arr.forEach((val, key) => {
      arr[key] = this.pinYin(val);
      if (key === arr.length - 1 && !file.isDirectory()) {
        arr[key] += '.html';
      }
    });
    return arr;
  }

  /**
   * 汉字转拼音
   * @param str string
   * @param needClear boolean
   */
  pinYin (str: string, needClear = true): string {
    if (needClear) {
      str = str.replace(/^[0-9]+\./, ''); // 替换开头的 1.等
      str = str.replace(/\s+/g, ''); // 替换空格
      str = str.replace(/[,|.|，|。|<|>|《|》|‘|’|“|”|"|?|？|（|）|(|)]/g, ''); // 替换逗号句号
    }
    // 如果有汉字添加随机字符串
    // const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
    // if (reg.test(str)){
    //   str = `${str}${this.generateRandomString(6)}`;
    // }
    let py: string = Pinyin(str, {
      style: Pinyin.STYLE_NORMAL
    }).join('-');
    py = py.toLowerCase();
    return py;
  }

  /**
   * 生成指定长的随机字符串
   * @param {Nubmer} len
   */
  generateRandomString (len: number): string {
    let rdmString = '';
    for (let i = 0; rdmString.length < len; i++) {
      rdmString += Math.random().toString(36).substr(2);
    }
    return rdmString.substr(0, len);
  }

  /**
   * 在gulp中加入文件
   * @param files AddFileItem[]
   */
  addVinylFiles (files: AddFileItem[] = []): Readable {
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
  transform (cb: (file: File, encoding: BufferEncoding, callback: () => void, t: Transform) => void): Transform {
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

export default MarkdownToHtml;
