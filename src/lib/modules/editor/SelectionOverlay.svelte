<script lang="ts">
  import { useSelectedId, useBoundingRects } from '../../entities/selection/store';
  import { createRelativeBoundingRectObservable } from '../../base/dom/createRelativeBoundingRectObservable';
  import { observableState } from '../../base/svelte-rx/observableState.svelte';
  import { getTypeColor } from '../../entities/editor/colors';
  import { useEditorMode } from '../../entities/editor/modeStore';
  
  const selectedId = $derived(useSelectedId());
  const boundingRects = $derived(useBoundingRects());
  const editorMode = $derived(useEditorMode());
  const isEditMode = $derived(editorMode === 'edit');
  
  // 선택된 요소를 DOM에서 찾기
  const selectedElement = $derived.by(() => {
    if (!selectedId) return null;
    return document.querySelector(`[data-node-id="${selectedId}"]`) as HTMLElement | null;
  });
  
  // 선택된 요소의 타입
  const selectedType = $derived.by(() => {
    if (!selectedElement) return null;
    return selectedElement.getAttribute('data-editable');
  });
  
  // 표시용 타입 이름
  const displayType = $derived.by(() => {
    if (!selectedType) return 'Unknown';
    
    // 타입을 더 읽기 쉬운 형태로 변환
    switch(selectedType) {
      case 'text': return 'Text';
      case 'repeat': return 'Repeat';
      case 'icon': return 'Icon';
      case 'image': return 'Image';
      case 'link': return 'Link';
      case 'block': return 'Block';
      case 'section': return 'Section';
      default: return selectedType || 'Unknown';
    }
  });
  
  // 타입별 색상
  const typeColor = $derived(getTypeColor(selectedType));
  
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
  
</script>


{#if selectedId && selectedRect && !isEditMode}
  <!-- 선택 영역 표시 (편집 모드가 아닐 때만) -->
  <div 
    class="selection-overlay"
    style="
      left: {selectedRect.left}px;
      top: {selectedRect.top}px;
      width: {selectedRect.width}px;
      height: {selectedRect.height}px;
      --type-color: {typeColor};
    "
  >
    <div class="selection-info">
      {displayType}
    </div>
  </div>
{/if}

<style>
  .selection-overlay {
    position: absolute;
    border: 2px solid var(--type-color);
    background: color-mix(in srgb, var(--type-color) 8%, transparent);
    pointer-events: none;
    z-index: 1000;
    border-radius: 4px;
  }
  
  .selection-info {
    position: absolute;
    top: -24px;
    left: 0;
    background: var(--type-color);
    color: white;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 3px;
    white-space: nowrap;
  }
</style>