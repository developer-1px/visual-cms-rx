import { reducer } from '../../base/svelte-rx/svelte-rx.svelte';
import { storePath } from '../storePath';
import {
  _모드변경,
  _편집모드켜기,
  _보기모드켜기,
  _선택모드켜기,
  _편집모드전환
} from '../../actions/editor/mode';

// 에디터 모드 타입
export type EditorMode = 'view' | 'select' | 'edit';

// 에디터 모드 상태 관리
export const useEditorMode = reducer(
  storePath.editor.mode, // path 객체를 직접 전달
  'select' as EditorMode, // 기본값: edit (기존 editMode.active: true와 동일)
  on => {
    on(_모드변경, (_, mode) => mode);
    on(_편집모드켜기, () => 'edit');
    on(_보기모드켜기, () => 'view');
    on(_선택모드켜기, () => 'select');
    
    // boolean 호환성 (기존 코드 마이그레이션용)
    on(_편집모드전환, (_, isEditMode) => isEditMode ? 'edit' : 'select');
  }
);

