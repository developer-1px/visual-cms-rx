<script lang="ts">
  import { dispatch } from './base/svelte-rx/svelte-rx.svelte';
  import { useSelectedId, useBoundingRects, _선택해제하기 } from './entities/selection';
  import { createRelativeBoundingRectObservable } from './base/dom/createRelativeBoundingRectObservable';
  import { observableState } from './base/svelte-rx/observableState.svelte';
  
  const selectedId = $derived(useSelectedId());
  const boundingRects = $derived(useBoundingRects());
  
  // 선택된 요소를 DOM에서 찾기
  const selectedElement = $derived.by(() => {
    if (!selectedId) return null;
    return document.querySelector(`[data-node-id="${selectedId}"]`) as HTMLElement | null;
  });
  
  // 선택된 요소의 상대 좌표를 실시간으로 추적
  const rectGetter = observableState(
    () => {
      if (!selectedElement) return null;
      const container = selectedElement.closest('.html-editor') as HTMLElement;
      if (!container) return null;
      return createRelativeBoundingRectObservable(selectedElement, container);
    }
  );
  
  const selectedRect = $derived.by(() => {
    const rect = rectGetter();
    if (!rect) {
      // Observable이 아직 없으면 store의 초기값 사용
      if (!selectedId || !boundingRects[selectedId]) return null;
      const storedRect = boundingRects[selectedId];
      return {
        left: storedRect.left,
        top: storedRect.top,
        width: storedRect.width,
        height: storedRect.height,
        right: storedRect.right,
        bottom: storedRect.bottom
      };
    }
    
    // Observable에서 실시간 좌표 사용
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom
    };
  });
  
  function handleBackdropClick() {
    dispatch(_선택해제하기());
  }
</script>

<!-- 배경 클릭 시 선택 해제 (항상 표시) -->
<div 
  class="selection-backdrop" 
  class:visible={selectedId}
  onclick={handleBackdropClick}
></div>

{#if selectedId && selectedRect}
  <!-- 선택 영역 표시 -->
  <div 
    class="selection-overlay"
    style="
      left: {selectedRect.left}px;
      top: {selectedRect.top}px;
      width: {selectedRect.width}px;
      height: {selectedRect.height}px;
    "
  >
    <div class="selection-info">
      ID: {selectedId}
      <br>
      Size: {Math.round(selectedRect.width)} × {Math.round(selectedRect.height)}
    </div>
  </div>
{/if}

<style>
  .selection-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  }
  
  .selection-backdrop.visible {
    z-index: 999;
    pointer-events: auto;
  }
  
  .selection-overlay {
    position: absolute;
    border: 2px solid #0066ff;
    background: rgba(0, 102, 255, 0.1);
    pointer-events: none;
    z-index: 1000;
  }
  
  .selection-info {
    position: absolute;
    top: -40px;
    left: 0;
    background: #0066ff;
    color: white;
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
  }
</style>