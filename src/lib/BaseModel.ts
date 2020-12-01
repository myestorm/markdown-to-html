import { pageDataInterface, TreeNodeItem } from './T';
import Totonoo from './Totonoo';

export default abstract class Model extends Totonoo {
  template = '';
  pageData: pageDataInterface = {
    head: {
      title: '',
      keywords: '',
      description: '',
      styles: []
    },
    body: {
      header: {
        topnav: [],
        current: 0
      },
      main: {
      },
      footer: {
        beian: '',
        copyright: ['', '']
      },
      foot: {
        scripts: []
      }
    }
  };

  constructor (template: string) {
    super();
    this.template = template;
  }

  abstract render (info: TreeNodeItem): string;

  // 组合页面标题
  mkPageTitle (title: string): string {
    const { siteName } = this.siteConfig;
    return title ? `${title} - ${siteName}` : siteName;
  }

  // 组合模板地址
  mkTemplatePath (): string {
    const templateConfig = this.templateConfig;
    return `${templateConfig.root}/${this.template}`;
  }

  // 组合链接前缀
  mkUrlPrev (arr: string[] | string): string[] | string {
    const { hosts } = this.siteConfig;
    let res;
    if (Array.isArray(arr)) {
      res = [];
      arr.forEach(val => {
        res.push(`${hosts}${val}`);
      });
    } else {
      res = `${hosts}${arr}`;
    }
    return res;
  }
}
