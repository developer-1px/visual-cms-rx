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