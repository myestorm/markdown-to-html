import { AnchorOptions } from 'markdown-it-anchor';
import { SiteConfig, TemplateConfig, DocConfig } from '../lib/Interfaces';

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
  beian: '粤ICP备12041241号',
  logo: '',
  favicon: '/favicon.ico',
  copyright: ['2005', new Date().getFullYear() + '']
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
  markdownItAnchor,
  siteConfig,
  docConfig
};
