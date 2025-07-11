<script lang="ts">
  import { useHoveredNodeId } from '../../entities/editor/hoverStore';
  import { getCurrentState } from '../../base/svelte-rx/svelte-rx.svelte';
  import { storePath } from '../../entities/storePath';
  import type { HtmlNode } from '../../entities/editor/types';
  
  const hoveredNodeId = $derived(useHoveredNodeId());
  
  // hover된 요소의 위치와 정보 가져오기
  const hoveredElement = $derived(() => {
    if (!hoveredNodeId) return null;
    
    const element = document.querySelector(`[data-node-id="${hoveredNodeId}"]`) as HTMLElement;
    if (!element) return null;
    
    const nodes = getCurr햣 entState(storePath.editor.document.nodes);
    const node = nodes?.get(hoveredNodeId) as HtmlNode | undefined;
    if (!node) return null;
    
    const rect = element.getBoundingClientRect();
    const containerElement = document.querySelector('.html-editor');
    if (!containerElement) return null;
    
    const containerRect = containerElement.getBoundingClientRect();
    
    return {
      node,
      rect: {
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        width: rect.width,
        height: rect.height
      }
    };
  });
</script>

{#if hoveredElement()}
  {@const element = hoveredElement()}
  {#if element}
    {@const { node, rect } = element}
    
    <!-- Hover 오버레이 -->
    <div 
      class="hover-overlay"
      style="
        top: {rect.top}px;
        left: {rect.left}px;
        width: {rect.width}px;
        height: {rect.height}px;
      "
    >
      <!-- 타입별 hover 스타일 -->
      {#if node.editableType === 'text'}
        <div class="hover-outline hover-text"></div>
      {:else if node.editableType === 'icon' || node.editableType === 'image'}
        <div class="hover-outline"></div>
      {:else if node.editableType === 'button' || node.editableType === 'link'}
        <div class="hover-outline hover-solid"></div>
      {:else if node.editableType === 'section' || node.editableType === 'repeat'}
        <div class="hover-outline hover-dashed"></div>
        {#if node.editableType === 'section'}
          <div class="hover-background"></div>
        {/if}
      {:else}
        <div class="hover-outline"></div>
      {/if}
    </div>
  {/if}
{/if}

<style>
  .hover-overlay {
    position: absolute;
    pointer-events: none;
    z-index: 10;
  }
  
  /* 기본 아웃라인 */
  .hover-outline {
    position: absolute;
    inset: -2px;
    border: 2px solid #0066ff;
    border-radius: 2px;
  }
  
  /* 텍스트용 사각형 (얇은 테두리) */
  .hover-outline.hover-text {
    border-width: 1px;
    border-color: #0066ff;
    opacity: 0.8;
  }
  
  /* 실선 아웃라인 */
  .hover-outline.hover-solid {
    border-style: solid;
  }
  
  /* 점선 아웃라인 */
  .hover-outline.hover-dashed {
    border-style: dashed;
  }
  
  /* 배경색 (section용) */
  .hover-background {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 102, 255, 0.05);
    border-radius: 2px;
  }
</style>