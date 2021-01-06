// 修改自：https://github.com/revin/markdown-it-task-lists
// 和 https://github.com/truh/markdown-it-task-lists

import MarkdownIt from 'markdown-it';
import Token from 'markdown-it/lib/token';
import StateCore from 'markdown-it/lib/rules_core/state_core';

let disableCheckboxes = true;
let useLabelWrapper = false;
let useLabelAfter = false;
let lineNumber = false;

interface Options {
  enabled?: boolean,
  label?: boolean,
  labelAfter?: boolean,
  lineNumber?: boolean
}

function attrSet(token: Token, name: string, value: string): void {
  const index = token.attrIndex(name);
  const attr: [string, string] = [name, value];

  if (index < 0) {
    token.attrPush(attr);
  } else {
    if (token && token.attrs) {
      token.attrs[index] = attr;
    }
  }
}

function parentToken(tokens: Token[], index: number): number {
  const targetLevel = tokens[index].level - 1;
  for (let i = index - 1; i >= 0; i--) {
    if (tokens[i].level === targetLevel) {
      return i;
    }
  }
  return -1;
}

function isTodoItem(tokens: Token[], index: number): boolean {
  return isInline(tokens[index]) &&
    isParagraph(tokens[index - 1]) &&
    isListItem(tokens[index - 2]) &&
    startsWithTodoMarkdown(tokens[index]);
}

function todoify(token: Token) {
  if (token.children) {
    token.children.unshift(makeCheckbox(token));
    token.children[1].content = token.children[1].content.slice(3);
    token.content = token.content.slice(3);

    if (useLabelWrapper) {
      if (useLabelAfter) {
        token.children.pop();
        const id = 'task-item-' + Math.ceil(Math.random() * (10000 * 1000) - 1000);
        token.children[0].content = token.children[0].content.slice(0, -1) + ' id="' + id + '">';
        token.children.push(afterLabel(token.content, id));
      } else {
        token.children.unshift(beginLabel());
        token.children.push(endLabel());
      }
    }
  }
}

function makeCheckbox(token: Token) {
  const checkbox = new Token('html_inline', '', 0);
  const disabledAttr = disableCheckboxes ? ' disabled="" ' : '';
  const dataLine = lineNumber ? (token.map ? `data-line="${token.map[0]}"` : 'data-line=""') : '';
  if (token.content.indexOf('[ ] ') === 0) {
    checkbox.content = '<input class="task-list-item-checkbox"' + disabledAttr + 'type="checkbox" '+ dataLine +'>';
  } else if (token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0) {
    checkbox.content = '<input class="task-list-item-checkbox" checked=""' + disabledAttr + 'type="checkbox" '+ dataLine +'>';
  }
  return checkbox;
}

function beginLabel() {
  const token = new Token('html_inline', '', 0);
  token.content = '<label>';
  return token;
}

function endLabel() {
  const token = new Token('html_inline', '', 0);
  token.content = '</label>';
  return token;
}

function afterLabel(content: string, id: string) {
  const token = new Token('html_inline', '', 0);
  token.content = '<label class="task-list-item-label" for="' + id + '">' + content + '</label>';
  token.attrs = [['for', 'id']];
  return token;
}

function isInline(token: Token): boolean {
  return token.type === 'inline';
}
function isParagraph(token: Token): boolean {
  return token.type === 'paragraph_open';
}
function isListItem(token: Token): boolean {
  return token.type === 'list_item_open';
}

function startsWithTodoMarkdown(token: Token): boolean {
  return token.content.indexOf('[ ] ') === 0 || token.content.indexOf('[x] ') === 0 || token.content.indexOf('[X] ') === 0;
}

function MarkdownItTaskLists (md: MarkdownIt, options: Options): void {
  if (options) {
    disableCheckboxes = !options.enabled;
    useLabelWrapper = !!options.label;
    useLabelAfter = !!options.labelAfter;
    lineNumber = !!options.lineNumber;
  }

  md.core.ruler.after('inline', 'github-task-lists', function (state: StateCore): boolean {
    const tokens = state.tokens;
    for (let i = 2; i < tokens.length; i++) {
      if (isTodoItem(tokens, i)) {
        todoify(tokens[i]);
        attrSet(tokens[i-2], 'class', 'task-list-item' + (!disableCheckboxes ? ' enabled' : ''));
        attrSet(tokens[parentToken(tokens, i-2)], 'class', 'totonoo--task-list');
      }
    }
    return false;
  });
}
export default MarkdownItTaskLists;
