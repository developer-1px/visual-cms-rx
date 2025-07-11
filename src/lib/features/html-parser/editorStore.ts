import { action, reducer } from '../../base/svelte-rx/svelte-rx.svelte.js';
import { storePath } from '../../entities/storePath';
import { 텍스트업데이트 } from '../../actions/editor/text';

// Actions - 한글로 작성
export const _문서설정하기 = action<{
  root: any;
  nodes: Map<string, any>;
}>('_문서설정하기');

export const _선택영역설정하기 = action<{
  nodeId: string;
  start: number;
  end: number;
} | null>('_선택영역설정하기');

export const _선택영역초기화하기 = action<void>('_선택영역초기화하기');

export const _편집모드변경하기 = action<'view' | 'edit' | 'select'>('_편집모드변경하기');

export const _실행취소하기 = action<void>('_실행취소하기');
export const _다시실행하기 = action<void>('_다시실행하기');

// Initial state - 스키마에 맞춰 초기화
interface EditorStoreState {
  document: {
    root: any;
    nodes: Map<string, any>;
  };
  selection: { nodeId: string; start: number; end: number; } | null;
  history: {
    past: Array<{ document: any; selection: any }>;
    future: Array<{ document: any; selection: any }>;
  };
  mode: 'view' | 'edit' | 'select';
}

const initialState: EditorStoreState = {
  document: {
    root: { id: 'root', type: 'element', tagName: 'div', children: [] },
    nodes: new Map()
  },
  selection: null,
  history: {
    past: [],
    future: []
  },
  mode: 'view'
};

// Create reducer and initialize it
export const useEditorState = reducer(storePath.editor, initialState, on => {
  on(_문서설정하기, (state, document) => {
    // 히스토리에 현재 상태 저장
    const newHistory = {
      past: [...state.history.past, { document: state.document, selection: state.selection }],
      future: []
    };
    
    return {
      ...state,
      document,
      history: newHistory
    };
  });
  
  on(_선택영역설정하기, (state, selection) => ({
    ...state,
    selection,
    mode: selection ? 'select' : state.mode
  }));
  
  on(_선택영역초기화하기, (state) => ({
    ...state,
    selection: null,
    mode: 'view'
  }));
  
  on(_편집모드변경하기, (state, mode) => ({
    ...state,
    mode
  }));
  
  on(_실행취소하기, (state) => {
    if (state.history.past.length === 0) return state;
    
    const previousState = state.history.past[state.history.past.length - 1];
    const newPast = state.history.past.slice(0, -1);
    const newFuture = [
      { document: state.document, selection: state.selection },
      ...state.history.future
    ];
    
    return {
      ...state,
      document: previousState.document,
      selection: previousState.selection,
      history: {
        past: newPast,
        future: newFuture
      }
    };
  });
  
  on(_다시실행하기, (state) => {
    if (state.history.future.length === 0) return state;
    
    const nextState = state.history.future[0];
    const newPast = [
      ...state.history.past,
      { document: state.document, selection: state.selection }
    ];
    const newFuture = state.history.future.slice(1);
    
    return {
      ...state,
      document: nextState.document,
      selection: nextState.selection,
      history: {
        past: newPast,
        future: newFuture
      }
    };
  });
  
  on(텍스트업데이트, (state, { nodeId, text }) => {
    const node = state.document.nodes.get(nodeId);
    if (!node || node.type !== 'text') return state;
    
    // 히스토리에 현재 상태 저장
    const newHistory = {
      past: [...state.history.past, { document: state.document, selection: state.selection }],
      future: []
    };
    
    // 노드 업데이트
    const updatedNode = { ...node, textContent: text };
    const updatedNodes = new Map(state.document.nodes);
    updatedNodes.set(nodeId, updatedNode);
    
    // 루트 노드도 업데이트 (재귀적으로 찾아서 업데이트)
    const updateNodeInTree = (node: any): any => {
      if (node.id === nodeId) {
        return updatedNode;
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNodeInTree)
        };
      }
      return node;
    };
    
    const updatedRoot = updateNodeInTree(state.document.root);
    
    return {
      ...state,
      document: {
        root: updatedRoot,
        nodes: updatedNodes
      },
      history: newHistory
    };
  });
});