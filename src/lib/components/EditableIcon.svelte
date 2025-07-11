<script lang="ts">
  import type { HtmlNode } from '../entities/editor/types';
  import { createEditableEventHandlers } from '../utils/editableEvents';
  import { useHoveredNodeId } from '../entities/editor/hoverStore';
  
  interface Props {
    node: HtmlNode;
  }
  
  let { node }: Props = $props();
  
  const hoveredNodeId = $derived(useHoveredNodeId());
  const { isHovered, editableAttributes } = $derived(createEditableEventHandlers(node, hoveredNodeId));
  
  function reconstructSvgHTML(node: HtmlNode): string {
    if (node.type === 'text') {
      return node.textContent || '';
    }
    
    if (node.type === 'element') {
      const tag = node.tagName;
      const attrs = node.attributes || {};
      
      const attrString = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      
      const children = node.children || [];
      const childrenHTML = children.map((child: any) => reconstructSvgHTML(child)).join('');
      
      return `<${tag}${attrString ? ' ' + attrString : ''}>${childrenHTML}</${tag}>`;
    }
    
    return '';
  }
</script>

{#if node.tagName === 'svg'}
  {@const svgContent = reconstructSvgHTML(node)}
  <div 
    {...editableAttributes}
    style="display: inline-block; cursor: pointer; {node.attributes?.style || ''}"
  >
    {@html svgContent}
  </div>
{:else}
  <!-- 기타 아이콘 타입들 -->
  <div 
    {...editableAttributes}
    style="display: inline-block; cursor: pointer; {node.attributes?.style || ''}"
  >
    {node.textContent || '🔸'}
  </div>
{/if}

<style>
  /* 아이콘 특화 스타일 */
  div {
    transition: opacity 0.2s ease;
  }
  
  /* SVG 내부 요소들이 클릭 이벤트를 가로채지 않도록 */
  div :global(svg),
  div :global(svg *) {
    pointer-events: none;
  }
</style>