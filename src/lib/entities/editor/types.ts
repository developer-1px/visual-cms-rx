// 에디터 관련 엔티티 타입들
export interface HtmlNode {
  id: string;
  type: 'element' | 'text';
  tagName?: string;
  attributes?: Record<string, string>;
  children?: HtmlNode[];
  textContent?: string;
  parent?: string;
}

export interface TextSelection {
  nodeId: string;
  start: number;
  end: number;
}

export interface EditorState {
  document: {
    root: HtmlNode;
    nodes: Map<string, HtmlNode>;
  };
  selection: TextSelection | null;
}

export interface EditorHistory {
  past: EditorState[];
  future: EditorState[];
}

export type EditorMode = 'view' | 'edit' | 'select';