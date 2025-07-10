import { reducer } from '../../base/svelte-rx/svelte-rx.svelte';
import { _선택하기, _선택해제하기, _크기변경하기, _컨텐츠변경하기 } from '../../actions/selection';
import { storePath } from '../storePath';

// 선택된 ID 관리
export const useSelectedId = reducer(storePath.selection.selectedId, null as string | null, on => {
  on(_선택하기, (state, payload) => payload.id)
  on(_선택해제하기, () => null)
})

// BoundingRect 정보 관리
export const useBoundingRects = reducer(storePath.selection.boundingRects, {} as Record<string, DOMRect>, on => {
  // 선택할 때 rect 정보 저장
  on(_선택하기, (state, payload) => ({
    ...state,
    [payload.id]: payload.rect
  }))
  
  // 크기 변경 시 업데이트
  on(_크기변경하기, (state, payload) => ({
    ...state,
    [payload.id]: payload.rect
  }))
  
  // 컨텐츠 변경 시 업데이트
  on(_컨텐츠변경하기, (state, payload) => ({
    ...state,
    [payload.id]: payload.rect
  }))
  
  // 선택 해제 시 해당 rect 제거
  on.merge(_선택하기, _선택해제하기, (state, payload) => {
    if (!payload) return state; // 선택해제 시
    
    // 선택하기 시 다른 요소들의 rect는 유지
    return state;
  })
})

// computed: 현재 선택된 요소의 타입
export const useSelectedType = reducer(storePath.selection.type, null as string | null, on => {
  // selectedId와 document.nodes가 변경될 때마다 타입 계산
  // on.combine을 사용하여 명확한 타입 추론
  on.combine(
    storePath.selection.selectedId,
    storePath.editor.document.nodes,
    (selectedId, nodes) => {
      if (!selectedId || !nodes) return null;
      
      // Document 모델에서 node 찾기
      const node = nodes.get(selectedId);
      if (!node) return null;
      
      // node의 attributes에서 data-editable 타입 가져오기
      return node.attributes?.['data-editable'] || null;
    }
  );
})