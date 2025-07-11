let nodeIdCounter = 0;

function generateNodeId(): string {
  return `node-${nodeIdCounter++}`;
}

import type { HtmlNode, EditableType } from '../../entities/editor/types';

// 텍스트 정규화 함수
function normalizeText(text: string): string {
  // 연속된 공백을 하나로, 줄바꿈을 공백으로 변환
  return text
    .replace(/\s+/g, ' ')  // 모든 연속된 공백(줄바꿈 포함)을 하나의 공백으로
    .trim();               // 앞뒤 공백 제거
}

// 요소의 편집 가능한 타입을 결정하는 함수
function determineEditableType(node: HtmlNode): EditableType {
  // 텍스트 노드는 항상 편집 가능
  if (node.type === 'text') {
    return 'text';
  }
  
  // element 타입인 경우
  if (node.type === 'element') {
    const tagName = node.tagName?.toLowerCase();
    const className = node.attributes?.class || '';
    const dataEditable = node.attributes?.['data-editable'];
    
    // data-editable 속성이 있으면 우선 사용
    if (dataEditable) {
      return dataEditable as EditableType;
    }
    
    // 이미지 체크
    if (tagName === 'img') {
      return 'image';
    }
    
    // 아이콘 체크
    if (tagName === 'svg' || className.includes('icon') || className.includes('lucide')) {
      return 'icon';
    }
    
    // 버튼 체크
    if (tagName === 'button' || className.includes('btn') || className.includes('button')) {
      return 'button';
    }
    
    // 링크 체크
    if (tagName === 'a') {
      return 'link';
    }
    
    // section 체크
    if (tagName === 'section' || className.includes('section')) {
      return 'section';
    }
    
    // repeat 체크 (반복되는 요소들)
    if (tagName === 'ul' || tagName === 'ol' || tagName === 'li' || 
        className.includes('repeat') || className.includes('list') || 
        className.includes('grid') || className.includes('items')) {
      return 'repeat';
    }
  }
  
  return null;
}

function parseNode(domNode: Node, parent?: string): HtmlNode | null {
  if (domNode.nodeType === Node.TEXT_NODE) {
    const rawText = domNode.textContent || '';
    const normalizedText = normalizeText(rawText);
    
    // Skip empty text nodes
    if (!normalizedText) return null;
    
    const textNode: HtmlNode = {
      id: generateNodeId(),
      type: 'text',
      textContent: normalizedText,
      parent
    };
    textNode.editableType = determineEditableType(textNode);
    return textNode;
  }
  
  if (domNode.nodeType === Node.ELEMENT_NODE) {
    const element = domNode as Element;
    const node: HtmlNode = {
      id: generateNodeId(),
      type: 'element',
      tagName: element.tagName.toLowerCase(),
      attributes: {},
      children: [],
      parent
    };
    
    // Parse attributes
    for (const attr of element.attributes) {
      node.attributes![attr.name] = attr.value;
    }
    
    // Parse children
    for (const child of element.childNodes) {
      const childNode = parseNode(child, node.id);
      if (childNode) {
        node.children!.push(childNode);
      }
    }
    
    // 요소의 editableType 결정
    node.editableType = determineEditableType(node);
    
    return node;
  }
  
  return null;
}

export function parseHtml(html: string): { root: HtmlNode; nodes: Map<string, HtmlNode> } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  
  const nodes = new Map<string, HtmlNode>();
  const root: HtmlNode = {
    id: generateNodeId(),
    type: 'element',
    tagName: 'div',
    attributes: { class: 'parsed-content' },
    children: []
  };
  
  nodes.set(root.id, root);
  
  // Parse all children of body
  for (const child of body.childNodes) {
    const node = parseNode(child, root.id);
    if (node) {
      root.children!.push(node);
      collectNodes(node, nodes);
    }
  }
  
  return { root, nodes };
}

function collectNodes(node: HtmlNode, nodes: Map<string, HtmlNode>) {
  nodes.set(node.id, node);
  if (node.children) {
    for (const child of node.children) {
      collectNodes(child, nodes);
    }
  }
}

// Convert the HTML template to a string for parsing
export function templateToHtml(container: Element): string {
  return container.innerHTML;
}