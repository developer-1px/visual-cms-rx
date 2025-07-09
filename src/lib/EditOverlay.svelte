<script lang="ts">
  import { dispatch } from './base/svelte-rx/svelte-rx.svelte';
  import { _선택하기 } from './entities/selection';
  import { toRelativeCoordinates, toSimpleRect } from './base/dom/coordinates';
  import { createRelativeBoundingRectObservable } from './base/dom/createRelativeBoundingRectObservable';
  
  interface Props {
    isEditMode: boolean;
  }
  
  let { isEditMode }: Props = $props();
  let overlayElement: HTMLDivElement = $state()!;
  let hoveredElement = $state<HTMLElement | null>(null);
  
  // 호버된 요소의 편집 타입
  const editableType = $derived(
    hoveredElement?.getAttribute('data-editable') || null
  );
  
  // 호버된 요소의 상대 좌표를 실시간으로 추적
  let hoverRectSubscription: (() => void) | null = null;
  let hoverRect = $state<{ left: number; top: number; width: number; height: number } | null>(null);
  
  $effect(() => {
    // 이전 구독 정리
    if (hoverRectSubscription) {
      hoverRectSubscription();
      hoverRectSubscription = null;
    }
    
    if (!hoveredElement || !overlayElement?.parentElement) {
      hoverRect = null;
      return;
    }
    
    // 새로운 구독 설정
    const rect$ = createRelativeBoundingRectObservable(hoveredElement, overlayElement.parentElement);
    const subscription = rect$.subscribe(rect => {
      hoverRect = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      };
    });
    
    hoverRectSubscription = () => subscription.unsubscribe();
    
    // cleanup
    return () => {
      if (hoverRectSubscription) {
        hoverRectSubscription();
        hoverRectSubscription = null;
      }
    };
  });
  
  function handleOverlayClick(event: MouseEvent) {
    if (!isEditMode) return;
    
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
    if (!isEditMode) return;
    
    const { clientX, clientY } = event;
    
    // 오버레이를 잠시 숨겨서 아래 요소들 탐색
    overlayElement.style.pointerEvents = 'none';
    const elements = document.elementsFromPoint(clientX, clientY);
    overlayElement.style.pointerEvents = 'auto';
    
    // 편집 가능한 요소 찾기
    const hoverable = elements.find(el => 
      el instanceof HTMLElement && el.hasAttribute('data-editable')
    ) as HTMLElement | undefined;
    
    // 호버된 요소 상태만 업데이트 (좌표는 Observable이 자동 추적)
    hoveredElement = hoverable || null;
  }
</script>

{#if isEditMode}
  <div 
    bind:this={overlayElement}
    class="edit-overlay"
    onclick={handleOverlayClick}
    onmousemove={handleOverlayMouseMove}
  ></div>
  
  <!-- 호버 프리뷰 -->
  {#if hoverRect}
    <div 
      class="hover-preview"
      class:text-editable={editableType === 'text'}
      class:repeat-editable={editableType === 'repeat'}
      style="
        left: {hoverRect.left}px;
        top: {hoverRect.top}px;
        width: {hoverRect.width}px;
        height: {hoverRect.height}px;
      "
    >
      <div class="editable-label">
        {editableType === 'text' ? '텍스트' : '반복 요소'}
      </div>
    </div>
  {/if}
{/if}

<style>
  .edit-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    cursor: crosshair;
    background: transparent;
  }
  
  .hover-preview {
    position: absolute;
    pointer-events: none;
    border: 2px dashed #0066ff;
    background: rgba(0, 102, 255, 0.05);
    z-index: 9998;
    transition: all 0.1s ease-out;
  }
  
  .hover-preview.text-editable {
    border-color: #00cc66;
    background: rgba(0, 204, 102, 0.05);
  }
  
  .hover-preview.repeat-editable {
    border-color: #ff6600;
    background: rgba(255, 102, 0, 0.05);
  }
  
  .editable-label {
    position: absolute;
    top: -24px;
    left: 0;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    background: #0066ff;
    border-radius: 3px;
    white-space: nowrap;
  }
  
  .text-editable .editable-label {
    background: #00cc66;
  }
  
  .repeat-editable .editable-label {
    background: #ff6600;
  }
</style>