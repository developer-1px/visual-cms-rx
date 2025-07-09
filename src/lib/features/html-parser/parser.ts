let nodeIdCounter = 0;

function generateNodeId(): string {
  return `node-${nodeIdCounter++}`;
}

interface HtmlNode {
  id: string;
  type: 'element' | 'text';
  tagName?: string;
  attributes?: Record<string, string>;
  children?: HtmlNode[];
  textContent?: string;
  parent?: string;
}

function parseNode(domNode: Node, parent?: string): HtmlNode | null {
  if (domNode.nodeType === Node.TEXT_NODE) {
    const text = domNode.textContent || '';
    // Skip empty text nodes
    if (!text.trim()) return null;
    
    return {
      id: generateNodeId(),
      type: 'text',
      textContent: text,
      parent
    };
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