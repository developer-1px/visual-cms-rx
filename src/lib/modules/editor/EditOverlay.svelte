<script lang="ts">
  import { dispatch } from '../../base/svelte-rx/svelte-rx.svelte';
  import { _선택하기 } from '../../actions/selection';
  import { toRelativeCoordinates } from '../../base/dom/coordinates';
  
  import { useEditorMode } from '../../entities/editor/modeStore';
  
  const editorMode = $derived(useEditorMode());
  const actualEditMode = $derived(editorMode === 'edit');
  let overlayElement: HTMLDivElement = $state()!;
  let hoveredElements = $state<HTMLElement[]>([]);
  
  
  // 현재 호버된 가장 상위 텍스트 요소가 있는지 확인
  const hasTextHover = $derived(
    hoveredElements.some(el => el.getAttribute('data-editable') === 'text')
  );
  
  
  
  
  let previousHoveredTextElement: HTMLElement | null = null;
  
  $effect(() => {
    
    // 이전 호버 효과 제거
    if (previousHoveredTextElement) {
      previousHoveredTextElement.style.textDecoration = '';
      previousHoveredTextElement = null;
    }
    
    if (hoveredElements.length === 0) {
      return;
    }
    
    // 텍스트 요소에만 underline 스타일 적용
    hoveredElements.forEach((element) => {
      const type = element.getAttribute('data-editable');
      
      // 텍스트 요소인 경우 underline 스타일 적용
      if (type === 'text') {
        element.style.textDecoration = 'underline';
        element.style.textDecorationColor = 'rgba(34, 197, 94, 0.6)';
        element.style.textDecorationThickness = '2px';
        element.style.textUnderlineOffset = '2px';
        element.style["text-decoration-skip-ink"] = 'none';
        previousHoveredTextElement = element;
      }
    });
    
    // cleanup
    return () => {
      // 이전 호버 효과 제거
      if (previousHoveredTextElement) {
        previousHoveredTextElement.style.textDecoration = '';
        previousHoveredTextElement = null;
      }
    };
  });
  
  
  function handleOverlayClick(event: MouseEvent) {
    // 선택 모드에서만 클릭으로 선택 가능
    if (actualEditMode) return;
    
    const { clientX, clientY } = event;
    
    // 오버레이를 잠시 숨겨서 아래 요소들 탐색
    overlayElement.style.pointerEvents = 'none';
    const elements = document.elementsFromPoint(clientX, clientY);
    overlayElement.style.pointerEvents = 'auto';
    
    // 편집 가능한 요소 찾기 (data-editable 속성을 가진 요소)
    const selectable = elements.find(el => 
      el instanceof HTMLElement && el.hasAttribute('data-editable')
    ) as HTMLElement | undefined;
    
    if (selectable) {
      const id = selectable.getAttribute('data-node-id')!;
      const rect = selectable.getBoundingClientRect();
      const containerRect = overlayElement.parentElement!.getBoundingClientRect();
      
      // 순수 함수로 좌표 보정
      const adjustedRect = toRelativeCoordinates(rect, containerRect);
      
      dispatch(_선택하기({ id, rect: adjustedRect }));
      
      // 디버깅용 로그
      console.log('Selected element:', { id, rect: adjustedRect });
    }
  }
  
  function handleOverlayMouseMove(event: MouseEvent) {
    // 모든 모드에서 hover 효과 표시
    
    const { clientX, clientY } = event;
    
    // 오버레이를 잠시 숨겨서 아래 요소들 탐색
    overlayElement.style.pointerEvents = 'none';
    const elements = document.elementsFromPoint(clientX, clientY);
    overlayElement.style.pointerEvents = 'auto';
    
    // 편집 가능한 모든 요소 찾기 (중첩된 요소들 포함)
    const editableElements = elements.filter(el => 
      el instanceof HTMLElement && el.hasAttribute('data-editable')
    ) as HTMLElement[];
    
    // 호버된 요소들 상태 업데이트
    hoveredElements = editableElements;
  }
  
  function handleOverlayMouseLeave() {
    // 마우스가 오버레이를 벗어나면 호버 상태 초기화
    hoveredElements = [];
  }
</script>

<!-- 항상 표시되어 hover 효과 제공 -->
<div 
  bind:this={overlayElement}
  class="edit-overlay"
  class:text-cursor={hasTextHover && actualEditMode}
  onclick={handleOverlayClick}
  onmousemove={handleOverlayMouseMove}
  onmouseleave={handleOverlayMouseLeave}
></div>
  

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
  
  
</style>