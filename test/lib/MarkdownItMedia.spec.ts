// import { expect } from 'chai';
// import 'mocha';
// import File from 'vinyl';

import MarkdownIt from 'markdown-it';
import { html5Media } from '../../src/lib/MarkdownItMedia';

let markdownIt = new MarkdownIt();
markdownIt = markdownIt.use(html5Media);

const mdText = `
![Image text](/img/1.png)
![video](img/markdown_video.mp4)
![audio](img/markdown_audio.mp3)`;
const body = markdownIt.render(mdText);
console.log(body);
