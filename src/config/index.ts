import { AnchorOptions } from 'markdown-it-anchor';
import { SiteConfig, TemplateConfig, DocConfig } from '../lib/T';

export const markdownItAnchor: AnchorOptions = {
  level: 1,
  permalink: true,
  permalinkBefore: true,
  permalinkSymbol: '¶'
};

export const siteConfig: SiteConfig = {
  hosts: '/',
  siteName: 'totonoo 前端笔记',
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
  listDoc: 'readme.md',
  about: 'about.md',
  timeline: 'timeline.md'
};

export default {
  markdownItAnchor,
  siteConfig,
  docConfig
};
