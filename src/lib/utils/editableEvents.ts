import { dispatch, getCurrentState } from '../base/svelte-rx/svelte-rx.svelte';
import { _호버시작, _호버종료 } from '../actions/editor/hover';
import { _선택하기 } from '../actions/selection';
import { _선택모드켜기 } from '../actions/editor/mode';
import { toRelativeCoordinates } from '../base/dom/coordinates';
import type { HtmlNode } from '../entities/editor/types';
import { storePath } from '../entities/storePath';

export function createEditableEventHandlers(node: HtmlNode, hoveredNodeId: string | null) {
  const isHovered = hoveredNodeId === node.id;
  
  function handleMouseEnter() {
    if (hoveredNodeId !== node.id) {
      dispatch(_호버시작({ nodeId: node.id }));
    }
  }
  
  function handleMouseLeave() {
    if (hoveredNodeId === node.id) {
      dispatch(_호버종료());
    }
  }
  
  function handleClick(event: MouseEvent) {
    if (node.editableType) {
      // 클릭한 요소가 현재 요소인지 확인 (자식 요소 클릭이 아닌 경우만 처리)
      if (event.target !== event.currentTarget) {
        return; // 자식 요소를 클릭한 경우 무시
      }
      
      // 현재 에디터 모드 확인
      const currentMode = getCurrentState(storePath.editor.mode.toString());
      
      // edit 모드에서 non-text 요소를 클릭하면 선택 모드로 전환
      if (currentMode === 'edit' && node.editableType !== 'text') {
        dispatch(_선택모드켜기());
      }
      
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const containerElement = document.querySelector('.html-editor');
      if (containerElement) {
        const containerRect = containerElement.getBoundingClientRect();
        const adjustedRect = toRelativeCoordinates(rect, containerRect);
        dispatch(_선택하기({ id: node.id, rect: adjustedRect }));
      }
    }
  }
  
  const editableAttributes = {
    'data-node-id': node.id,
    'data-editable': node.editableType,
    onmouseenter: handleMouseEnter,
    onmouseleave: handleMouseLeave,
    onclick: handleClick
  };
  
  return {
    isHovered,
    editableAttributes
  };
}