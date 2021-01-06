import MarkdownIt from 'markdown-it';
import { AnchorOptions } from 'markdown-it-anchor';
import { SiteConfig, TemplateConfig, DocConfig } from '../lib/Interfaces';

export const markdownItOptions: MarkdownIt.Options = {
  html: true,
  xhtmlOut: false,
  breaks: false,
  langPrefix: 'language-',
  linkify: false,
  typographer: false
};

export const markdownItAnchor: AnchorOptions = {
  level: 1,
  permalink: true,
  permalinkBefore: true,
  permalinkSymbol: '¶'
};

export const siteConfig: SiteConfig = {
  hosts: '/', // 必须以/结尾
  siteName: 'markdown-to-html',
  siteRoot: 'www',
  logo: '/img/logo_primary.png',
  logoTxt: 'Totonoo',
  logoSuffix: '.com',
  beian: '粤ICP备12041241号',
  favicon: '/favicon.ico',
  copyright: ['2005', new Date().getFullYear() + ''],
  copyrightText: 'Totonoo.com'
};

export const templateConfig: TemplateConfig = {
  root: './src/template',
  config: 'config.json',
  pageSize: 20 // 列表分页大小
};

export const docConfig: DocConfig = {
  root: 'documents',
  listDoc: 'readme.md' // 不能是中文
};

export default {
  markdownItOptions,
  markdownItAnchor,
  siteConfig,
  docConfig
};
