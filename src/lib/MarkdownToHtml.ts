import path from 'path';
import fs from 'fs';
import File from 'vinyl';
import md5 from 'crypto-js/md5';
import Pinyin from 'pinyin';
import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import MarkdownItAnchor, { AnchorOptions } from 'markdown-it-anchor';
import FrontMatter, { FrontMatterResult } from 'front-matter';
import { Readable, Transform } from 'readable-stream';
import MarkdownItTaskLists from './MarkdownItTaskLists';
import { html5Media } from './MarkdownItMedia';
import { markdownItOptions, markdownItAnchor, siteConfig, templateConfig, docConfig } from '../config/index';
import {
  ModelTypes,
  GulpFileItem,
  MarkdownAttribute,
  MarkdownParseAttribute,
  MarkdownNavigation,
  TimelineItem,
  recommendTypes
} from './Interfaces';

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
    markdownItOptions,
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
  parseMarkdown (file: File): MarkdownParseAttribute {
    const nav: MarkdownNavigation[] = [];
    const _markdownItAnchorConfig = {
      ...this.config.markdownItAnchorConfig
    };
    const contents = file.contents || '';
    let fmContents: FrontMatterResult<MarkdownAttribute>;
    try {
      fmContents = FrontMatter(contents.toString());
    } catch (err) {
      throw new Error(`${file.path} 文件解析错误：${err.message}`);
    }
    const attributes = fmContents.attributes;
    const zoneOffset = new Date().getTimezoneOffset() * 1000 * 60;
    const timeline: TimelineItem[] = [];
    if (attributes.timeline && attributes.timeline.length > 0) {
      attributes.timeline.forEach(timelineItem => {
        timeline.push({
          publishDate: timelineItem.publishDate ?  (new Date(timelineItem.publishDate).getTime() + zoneOffset) : new Date().getTime(),
          title: timelineItem.title || '',
          image: timelineItem.image || '',
          desc: timelineItem.desc || '',
          link: timelineItem.link || '',
        });
      });
    }
    let markdownIt = new MarkdownIt(markdownItOptions);
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
    markdownIt = markdownIt.use(MarkdownItAnchor, _markdownItAnchorConfig).use(MarkdownItTaskLists).use(html5Media);
    const body = markdownIt.render(fmContents.body);

    const paths = this.parseDir(file);
    const cover = attributes.cover ? this.parseCover(file.path, attributes.cover) : '';

    const data: MarkdownParseAttribute = {
      id: attributes.mode === ModelTypes.Home ? 'index' : this.createId(paths),
      pid: this.createPid(paths),
      path: this.createPath(paths),
      paths: paths,
      body: body,
      navigation: nav,
      mode: attributes.mode || ModelTypes.Normal,
      title: attributes.title || '',
      publishDate: attributes.publishDate ?  (new Date(attributes.publishDate).getTime() + zoneOffset) : new Date().getTime(),
      icon: attributes.icon || '',
      keywords: attributes.keywords || [],
      desc: attributes.desc || '',
      order: attributes.order || 1,
      recommend: attributes.recommend || recommendTypes.Default,
      cover: cover,
      timeline: timeline,
      children: []
    };
    return data;
  }

  /**
   * 解析文档URL
   * @param file File
   * @param root string
   */
  parseDir (file: File): string[] {
    const rootDir = path.resolve(__dirname, `../../${this.config.docConfig.root}`);
    const dir = path.relative(rootDir, file.path);
    const arr = dir.split(path.sep);
    return arr;
  }

  /**
   * 处理cover的路径
   * @param paths
   */
  parseCover (filePath: string, coverPath: string): string {
    if (path.isAbsolute(coverPath)) {
      return coverPath;
    }
    const rootDir = path.resolve(__dirname, `../../${this.config.docConfig.root}`);
    const p = path.relative(rootDir, filePath);
    const o = path.parse(p);
    const c = path.join(o.dir, coverPath);
    const _arr = c.split(path.sep);
    const arr: string[] = [];
    _arr.forEach(item => {
      arr.push(this.pinYin(item, false, false));
    });
    return this.config.siteConfig.hosts + arr.join('/');
  }

  /**
   * 创建文档唯一索引
   * @param paths string[]
   */
  createId (paths: string[]): string {
    const _paths = Object.assign([], paths);
    if (_paths.includes(this.config.docConfig.listDoc)) {
      _paths.pop();
    }
    return _paths.join('/');
  }

  /**
   * 创建文档的父ID
   * @param paths string[]
   */
  createPid (paths: string[]): string {
    const _paths = Object.assign([], paths);
    if (_paths.includes(this.config.docConfig.listDoc)) {
      _paths.pop();
    }
    _paths.pop();
    return _paths.join('/');
  }

  /**
   * 创建文档路径
   * @param paths string[]
   */
  createPath (paths: string[]): string {
    const _paths: string[] = [];
    paths.forEach(item => {
      const o = path.parse(item);
      let _item = '';
      if (o.ext) {
        _item = this.pinYin(o.name);
        _item = _item + o.ext;
      } else {
        _item = this.pinYin(item);
      }
      _paths.push(_item);
    });
    return _paths.join('/');
  }

  /**
   * 汉字转拼音
   * @param str string
   * @param needClear boolean
   */
  pinYin (str: string, needClear = true, needMd5 = false): string {
    if (needClear) {
      str = str.replace(/^[0-9]+\./, ''); // 替换开头的 1.等
      str = str.replace(/\s+/g, ''); // 替换空格
      str = str.replace(/[,|.|，|。|<|>|《|》|‘|’|“|”|"|?|？|（|）|(|)]/g, ''); // 替换逗号句号
    }
    // 如果有汉字添加汉字的MD5的前6位
    let md5Str = '';
    const reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
    if (needMd5 && reg.test(str)){
      md5Str = md5(str).toString().substr(0, 6);
    }
    let py: string = Pinyin(str, {
      style: Pinyin.STYLE_NORMAL
    }).join('-');
    if (md5Str) {
      py = py + '-' + md5Str;
    }
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
  addVinylFiles (files: GulpFileItem[] = []): Readable {
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
