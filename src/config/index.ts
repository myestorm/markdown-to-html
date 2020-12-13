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
  beian: '',
  logo: '',
  favicon: '',
  copyright: ['2005', new Date().getFullYear() + '']
};

export const templateConfig: TemplateConfig = {
  root: './src/template',
  config: 'config.json',
  pageSize: 10 // 列表分页大小
};

export const docConfig: DocConfig = {
  root: 'documents',
  listDoc: 'readme.md', // 不能是中文
  about: 'about.md',
  timeline: 'timeline'
};

export default {
  markdownItAnchor,
  siteConfig,
  docConfig
};
