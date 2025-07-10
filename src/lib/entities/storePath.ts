import { createPathProxy } from '../base/svelte-rx/createPathProxy';
import type { HtmlNode, TextSelection } from './editor/types';
import type { SelectionState } from './selection/types';

/**
 * 전체 애플리케이션 State 스키마
 * 
 * 이것이 애플리케이션 상태 구조의 single source of truth입니다.
 * 모든 reducer와 state 관련 코드는 이 스키마를 참조해야 합니다.
 */
export interface StoreSchema {
  /**
   * 선택(Selection) 관련 상태
   * - UI에서 요소 선택과 관련된 모든 상태 관리
   */
  selection: SelectionState;

  /**
   * 에디터(Editor) 관련 상태
   * - HTML 문서 구조와 편집 관련 상태 관리
   */
  editor: {
    /** 문서 구조 */
    document: {
      /** 루트 HTML 노드 */
      root: HtmlNode;
      /** ID로 빠른 접근을 위한 노드 맵 */
      nodes: Map<string, HtmlNode>;
    };
    
    /** 텍스트 선택 정보 */
    selection: TextSelection | null;
    
    /** 실행 취소/다시 실행을 위한 히스토리 */
    history: {
      /** 이전 상태들 (실행 취소용) */
      past: EditorState[];
      /** 다시 실행할 상태들 */
      future: EditorState[];
    };
    
    /** 에디터 모드 */
    mode: 'view' | 'edit' | 'select';
  };
  
  /**
   * 클립보드 상태
   */
  clipboard: {
    type: 'text' | 'element' | null;
    content: string | null;
    nodeId: string | null;
  };
}

/**
 * 에디터 상태 스냅샷 (히스토리용)
 */
export interface EditorState {
  document: StoreSchema['editor']['document'];
  selection: StoreSchema['editor']['selection'];
  timestamp: number;
}

/**
 * 타입 안전한 store 경로 접근자
 * 
 * @example
 * storePath.editor.mode.toString() // "editor.mode"
 * storePath.selection.selectedId.toString() // "selection.selectedId"
 */
export const storePath = createPathProxy<StoreSchema>();