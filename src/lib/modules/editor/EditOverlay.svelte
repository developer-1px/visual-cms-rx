<script lang="ts">
  import { dispatch } from '../../base/svelte-rx/svelte-rx.svelte';
  import { _선택하기 } from '../../actions/selection';
  import { _편집모드켜기 } from '../../actions/editor/mode';
  import { toRelativeCoordinates } from '../../base/dom/coordinates';
  import { getTypeColor } from '../../entities/editor/colors';
  
  import { useEditorMode } from '../../entities/editor/modeStore';
  import { useSelectedId, useSelectedType } from '../../entities/selection/store';
  import { 
    selectElementWithSmartPolicy, 
    filterSelectableElements
  } from '../../base/dom/smartElementSelection';
  
  // Store 값들
  const editorMode = $derived(useEditorMode());
  const selectedId = $derived(useSelectedId());
  const selectedType = $derived(useSelectedType());
  
  // DOM 요소
  let overlayElement: HTMLDivElement = $state()!;
  
  // Hover 상태
  let hoveredId = $state<string | null>(null);
  let hoveredType = $state<string | null>(null);
  let hoveredRect = $state<DOMRect | null>(null);
  let previousHoveredId = $state<string | null>(null);
  
  // 계산된 값들
  const isEditMode = $derived(editorMode === 'edit');
  const hoveredColor = $derived(hoveredType ? getTypeColor(hoveredType) : null);
  const hasTextHover = $derived(hoveredType === 'text');

  // Hover 효과 처리
  $effect(() => {
    // 이전 hover 제거
    if (previousHoveredId && previousHoveredId !== hoveredId) {
      const prevElement = document.querySelector(`[data-node-id="${previousHoveredId}"]`);
      prevElement?.removeAttribute('data-hover');
    }
    
    // 새로운 text hover 추가
    if (hoveredId && hoveredType === 'text') {
      const element = document.querySelector(`[data-node-id="${hoveredId}"]`);
      element?.setAttribute('data-hover', 'true');
    }
    
    previousHoveredId = hoveredId;
    
    // cleanup
    return () => {
      if (previousHoveredId) {
        const element = document.querySelector(`[data-node-id="${previousHoveredId}"]`);
        element?.removeAttribute('data-hover');
      }
    };
  });
  
  function handleOverlayClick(event: MouseEvent) {
    const element = getElementAtPoint(event.clientX, event.clientY);
    if (!element) return;
    
    const id = element.getAttribute('data-node-id')!;
    const type = element.getAttribute('data-editable')!;

    console.log(`[EditOverlay] Clicked element: id=${id}, type=${type} selectedType=${selectedType}`);

    // 이미 선택된 텍스트를 다시 클릭하면 편집 모드로
    if (id === selectedId && type === 'text' && selectedType === 'text') {
      console.log('[EditOverlay] Switching to edit mode');
      dispatch(_편집모드켜기());
      return;
    }
    
    // 일반 선택
    const rect = element.getBoundingClientRect();
    const containerRect = overlayElement.parentElement!.getBoundingClientRect();
    const adjustedRect = toRelativeCoordinates(rect, containerRect);
    
    dispatch(_선택하기({ id, rect: adjustedRect }));
  }
  
  function handleOverlayMouseMove(event: MouseEvent) {
    const element = getElementAtPoint(event.clientX, event.clientY);
    
    if (element) {
      const id = element.getAttribute('data-node-id');
      const type = element.getAttribute('data-editable');
      
      // 선택된 요소는 hover하지 않음
      if (id === selectedId) {
        clearHoverState();
        return;
      }
      
      hoveredId = id;
      hoveredType = type;
      
      // text가 아닌 요소들의 rect 계산
      if (type !== 'text') {
        const rect = element.getBoundingClientRect();
        const containerRect = overlayElement.parentElement!.getBoundingClientRect();
        hoveredRect = toRelativeCoordinates(rect, containerRect) as DOMRect;
      } else {
        hoveredRect = null;
      }
    } else {
      clearHoverState();
    }
  }
  
  function handleOverlayMouseLeave() {
    clearHoverState();
  }
  
  function clearHoverState() {
    hoveredId = null;
    hoveredType = null;
    hoveredRect = null;
  }
  
  function getElementAtPoint(x: number, y: number): HTMLElement | null {
    overlayElement.style.pointerEvents = 'none';
    const elements = document.elementsFromPoint(x, y);
    overlayElement.style.pointerEvents = 'auto';
    
    const selectableElements = filterSelectableElements(elements);
    return selectElementWithSmartPolicy(selectableElements, selectedId) || null;
  }
</script>

<!-- 항상 표시되어 hover 효과 제공 -->
<div 
  bind:this={overlayElement}
  class="edit-overlay"
  class:text-cursor={hasTextHover && isEditMode}
  onclick={handleOverlayClick}
  onmousemove={handleOverlayMouseMove}
  onmouseleave={handleOverlayMouseLeave}
></div>

<!-- Hover 효과 표시 (text가 아닌 요소들만) -->
{#if hoveredRect && hoveredColor && hoveredType !== 'text'}
  <div 
    class="hover-overlay"
    style="
      left: {hoveredRect.left}px;
      top: {hoveredRect.top}px;
      width: {hoveredRect.width}px;
      height: {hoveredRect.height}px;
      --hover-color: {hoveredColor};
    "
  ></div>
{/if}
  

<style>
  .edit-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    cursor: default;
    background: transparent;
  }
  
  .edit-overlay.text-cursor {
    cursor: text;
  }
  
  .hover-overlay {
    position: absolute;
    pointer-events: none;
    z-index: 1000;
    box-shadow: inset 0 0 0 2px var(--hover-color);
    opacity: 0.5;
  }
  
  /* CSS를 통한 text hover 효과 */
  :global([data-hover="true"][data-editable="text"]) {
    text-decoration: underline !important;
    text-decoration-color: #0066ff !important;
    text-decoration-thickness: 2px !important;
  }
</style>